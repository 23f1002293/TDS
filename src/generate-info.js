// @ts-check
import { parse } from "acorn";
import { simple as walkSimple } from "acorn-walk";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * @typedef {import("estree").AwaitExpression} AwaitExpression
 * @typedef {import("estree").BlockStatement} BlockStatement
 * @typedef {import("estree").CallExpression} CallExpression
 * @typedef {import("estree").Expression} Expression
 * @typedef {import("estree").Literal} Literal
 * @typedef {import("estree").ObjectExpression} ObjectExpression
 * @typedef {import("estree").TemplateLiteral} TemplateLiteral
 * @typedef {import("estree").VariableDeclarator} VariableDeclarator
 *
 * Permitted value types for start/end fields.
 * @typedef {string | number | Date | ((...args: any[]) => unknown)} TemporalValue
 *
 * Compiled metadata structure for each exam.
 * @typedef {{ start: TemporalValue, end: TemporalValue, weights: Record<string, number> }} CompiledExamMeta
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaultRoot = __dirname;
/** @type {Map<string, string>} */
const questionIdCache = new Map();

/**
 * Collects metadata + weights from every exam under a root directory.
 * @param {string} [rootDir=defaultRoot]
 * @returns {Promise<{ compiled: Record<string, CompiledExamMeta>, outputPath: string, dependencies: Set<string> }>}
 */
export async function compileExamMetadata(rootDir = defaultRoot) {
  const files = await readdir(rootDir);
  const infoFiles = files.filter((file) => /^exam-.*\.info\.js$/.test(file)).sort();
  if (!infoFiles.length) {
    throw new Error("No exam info files found");
  }

  /** @type {Record<string, CompiledExamMeta>} */
  const compiled = {};
  const dependencies = new Set();
  for (const infoFile of infoFiles) {
    const examName = infoFile.replace(/\.info\.js$/, "");
    const examPath = join(rootDir, `${examName}.js`);
    dependencies.add(join(rootDir, infoFile));
    dependencies.add(examPath);
    // Import metadata module without executing the browser-only exam JS.
    const infoModule = await import(pathToFileURL(join(rootDir, infoFile)).href);
    const info = infoModule.default ?? infoModule;
    const questionEntries = await extractQuestionEntries(examPath);
    /** @type {Array<[string, number]>} */
    const weightEntries = [];

    for (const { questionFile, weight } of questionEntries) {
      dependencies.add(join(rootDir, questionFile));
      const questionId = await getQuestionId(questionFile, rootDir);
      weightEntries.push([questionId, weight]);
    }

    weightEntries.sort((a, b) => a[0].localeCompare(b[0]));
    compiled[examName] = {
      start: info.start,
      end: info.end,
      weights: Object.fromEntries(weightEntries),
    };
  }

  const outputPath = join(rootDir, "exam.info-generated.js");
  return { compiled, outputPath, dependencies };
}

/**
 * Writes the compiled metadata to disk and returns the data for further checks.
 * @param {string} [rootDir=defaultRoot]
 * @returns {Promise<{ compiled: Record<string, CompiledExamMeta>, outputPath: string, skipped: boolean }>}
 */
export async function writeCompiledMetadata(rootDir = defaultRoot) {
  const { compiled, outputPath, dependencies } = await compileExamMetadata(rootDir);
  const needsUpdate = await shouldWriteOutput(dependencies, outputPath);
  if (!needsUpdate) return { compiled, outputPath, skipped: true };
  await writeFile(outputPath, buildOutput(compiled), "utf8");
  return { compiled, outputPath, skipped: false };
}

/**
 * Parses an exam module and records every question import + weight.
 * @param {string} examPath
 * @returns {Promise<Array<{ questionFile: string, weight: number }>>}
 */
async function extractQuestionEntries(examPath) {
  const source = await readFile(examPath, "utf8");
  const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
  /** @type {Array<{ questionFile: string, weight: number }>} */
  const entries = [];

  // Scan every await expression; question imports always follow this pattern.
  walkSimple(ast, {
    /**
     * @param {import("acorn").Node} node
     * @param {unknown} _state
     */
    AwaitExpression(node, _state) {
      const entry = unwrapQuestionEntry(/** @type {AwaitExpression} */ (/** @type {unknown} */ (node)));
      if (entry) entries.push(entry);
    },
  });

  return entries;
}

/**
 * Attempts to unwrap `await import("./q-x.js").then((m) => m.default({...}))` calls.
 * @param {AwaitExpression} node
 * @returns {{ questionFile: string, weight: number } | null}
 */
function unwrapQuestionEntry(node) {
  const callExpr = /** @type {CallExpression | undefined} */ (node.argument);
  if (!callExpr || callExpr.type !== "CallExpression") return null;
  if (!callExpr.arguments.length) return null;

  // We only care about `.then(...)` chained on a dynamic import.
  const { callee } = callExpr;
  if (
    callee.type !== "MemberExpression"
    || callee.property.type !== "Identifier"
    || callee.property.name !== "then"
  ) {
    return null;
  }

  const importExpr = callee.object;
  if (!importExpr || importExpr.type !== "ImportExpression") return null;
  const sourceNode = importExpr.source;
  if (!sourceNode || sourceNode.type !== "Literal" || typeof sourceNode.value !== "string") return null;
  if (!sourceNode.value.startsWith("./q-") || !sourceNode.value.endsWith(".js")) return null;

  const firstArgument = callExpr.arguments[0];
  const optionsNode = extractOptionsNode(
    firstArgument && firstArgument.type !== "SpreadElement" ? firstArgument : undefined,
  );
  if (!optionsNode) return null;
  const weightValue = readWeightValue(optionsNode) ?? 1;

  return { questionFile: sourceNode.value.slice(2), weight: weightValue };
}

/**
 * Pulls the argument object passed into the question factory, if present.
 * @param {Expression | undefined} fnNode
 * @returns {ObjectExpression | null}
 */
function extractOptionsNode(fnNode) {
  if (!fnNode) return null;
  if (fnNode.type !== "ArrowFunctionExpression" && fnNode.type !== "FunctionExpression") return null;
  return unwrapCallObject(fnNode.body);
}

/**
 * Handles both concise and block arrow function styles to get the config object.
 * @param {Expression | BlockStatement} body
 * @returns {ObjectExpression | null}
 */
function unwrapCallObject(body) {
  if (!body) return null;
  // Concise arrow functions: `m.default({ ... })`
  if (body.type === "CallExpression") {
    return body.arguments[0] && body.arguments[0].type === "ObjectExpression"
      ? body.arguments[0]
      : null;
  }
  if (body.type !== "BlockStatement") return null;
  // Block bodies: locate the returned call's first argument.
  for (const stmt of body.body) {
    if (stmt.type === "ReturnStatement" && stmt.argument && stmt.argument.type === "CallExpression") {
      const arg = stmt.argument.arguments[0];
      if (arg?.type === "ObjectExpression") return arg;
    }
  }
  return null;
}

/**
 * Reads `{ weight: 0.5 }` from the config object; ignores computed keys.
 * @param {ObjectExpression} objectNode
 * @returns {number | null}
 */
function readWeightValue(objectNode) {
  for (const prop of objectNode.properties) {
    if (prop.type !== "Property" || prop.computed) continue;
    /** @type {string | undefined} */
    let keyName;
    if (prop.key.type === "Identifier") keyName = prop.key.name;
    else if (prop.key.type === "Literal" && typeof prop.key.value === "string") keyName = prop.key.value;
    if (keyName === "weight") {
      // Weight literals are always numeric; coerce for safety.
      if (prop.value.type === "Literal") return Number(prop.value.value);
    }
  }
  return null;
}

/**
 * Returns the cached question id, parsing the question file on first access.
 * @param {string} questionFile
 * @param {string} rootDir
 * @returns {Promise<string>}
 */
async function getQuestionId(questionFile, rootDir) {
  const cacheKey = `${rootDir}|${questionFile}`;
  if (questionIdCache.has(cacheKey)) return /** @type {string} */ (questionIdCache.get(cacheKey));
  const source = await readFile(join(rootDir, questionFile), "utf8");
  const id = extractQuestionId(source, questionFile);
  questionIdCache.set(cacheKey, id);
  return id;
}

/**
 * Extracts the `const id = "q-..."` definition, falling back to regex matching.
 * @param {string} source
 * @param {string} questionFile
 * @returns {string}
 */
function extractQuestionId(source, questionFile) {
  /** @type {string | undefined} */
  let found;
  const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
  walkSimple(ast, {
    /**
     * @param {import("acorn").Node} node
     * @param {unknown} _state
     */
    VariableDeclarator(node, _state) {
      const typedNode = /** @type {VariableDeclarator} */ (/** @type {unknown} */ (node));
      if (found) return;
      if (typedNode.id.type === "Identifier" && typedNode.id.name === "id") {
        const value = literalToString(typedNode.init);
        if (typeof value === "string") found = value;
      }
    },
  });

  // Some legacy questions inline the id inside templates; fallback to regex.
  if (found) return found;
  const fallback = source.match(/["'`]q-[^"'`]+["'`]/);
  if (fallback) return fallback[0].slice(1, -1);
  throw new Error(`Unable to extract question id from ${questionFile}`);
}

/**
 * Extracts string literals or template literals without expressions.
 * @param {Expression | null | undefined} node
 * @returns {string | undefined}
 */
function literalToString(node) {
  if (!node) return undefined;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
    const cooked = node.quasis[0]?.value?.cooked;
    if (typeof cooked === "string") return cooked;
    return undefined;
  }
  return undefined;
}

/**
 * Renders the compiled metadata map to a deterministic ESM file.
 * @param {Record<string, CompiledExamMeta>} data
 * @returns {string}
 */
function buildOutput(data) {
  const lines = [
    "// This file is auto-generated by src/generate-info.js",
    "// Do not edit manually.",
    "export default {",
  ];

  // Sorting ensures stable diffs when exams are added/removed.
  const exams = Object.keys(data).sort();
  for (const examName of exams) {
    const meta = data[examName];
    lines.push(`  "${examName}": {`);
    lines.push(formatField("start", meta.start, 4));
    lines.push(formatField("end", meta.end, 4));
    lines.push("    weights: {");
    const weightEntries = Object.entries(meta.weights);
    for (const [questionId, weight] of weightEntries) {
      lines.push(`      "${questionId}": ${weight},`);
    }
    lines.push("    },");
    lines.push("  },");
  }

  lines.push("};");
  return lines.join("\n");
}

/**
 * Serializes one field (start/end) with indentation preserved for multiline functions.
 * @param {string} name
 * @param {TemporalValue} value
 * @param {number} indentSize
 * @returns {string}
 */
function formatField(name, value, indentSize) {
  const indent = " ".repeat(indentSize);
  const prefix = `${indent}${name}: `;
  const serialized = serializeValue(value);
  // Preserve formatting for multiline function bodies by indenting nested lines.
  const needsIndent = serialized.includes("\n");
  const formatted = needsIndent ? serialized.replace(/\n/g, `\n${" ".repeat(prefix.length)}`) : serialized;
  return `${prefix}${formatted},`;
}

/**
 * Minimal serializer that handles primitives + function bodies.
 * @param {TemporalValue} value
 * @returns {string}
 */
function serializeValue(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (value == null) return "null";
  if (typeof value === "function") return value.toString();
  throw new Error(`Unsupported value type: ${typeof value}`);
}

const invokedDirectly = Boolean(
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url,
);

if (invokedDirectly) {
  writeCompiledMetadata()
    .then(({ outputPath, compiled, skipped }) => {
      if (skipped) console.log(`${outputPath} is up-to-date (${Object.keys(compiled).length} exams)`);
      else console.log(`Wrote ${outputPath} with ${Object.keys(compiled).length} exams`);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

/**
 * Checks whether any dependency has changed since the target was generated.
 * @param {Set<string>} dependencies
 * @param {string} targetPath
 * @returns {Promise<boolean>}
 */
async function shouldWriteOutput(dependencies, targetPath) {
  let targetStat;
  try {
    targetStat = await stat(targetPath);
  } catch {
    return true;
  }
  for (const filePath of dependencies) {
    try {
      const dependencyStat = await stat(filePath);
      if (dependencyStat.mtimeMs > targetStat.mtimeMs) return true;
    } catch {
      return true;
    }
  }
  return false;
}
