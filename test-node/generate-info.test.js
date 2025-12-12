// @ts-check
import test from "node:test";
import assert from "node:assert/strict";
import { compileExamMetadata } from "../src/generate-info.js";

/** @type {Awaited<ReturnType<typeof compileExamMetadata>>["compiled"]} */
let compiled;

test.before(async () => {
  ({ compiled } = await compileExamMetadata());
});

test("generate-info collects metadata for known exams", () => {
  assert.ok(Object.keys(compiled).length > 0);
  const exam = compiled["exam-tds-2025-01-ga1"];
  assert.ok(exam, "expected metadata for exam-tds-2025-01-ga1");
  assert.equal(exam.weights["q-uv-http-get"], 1);
});

test("generate-info sorts weights deterministically", () => {
  const exam = compiled["exam-tds-2025-01-ga1"];
  assert.ok(exam, "expected metadata for exam-tds-2025-01-ga1");
  const keys = Object.keys(exam.weights);
  assert.deepEqual(keys, [...keys].sort());
});
