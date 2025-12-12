export function compareJSON(expected, actual, options = { verbose: false }, path = "") {
  // Handle null values
  if (expected === null && actual === null) {
    return;
  }
  if (expected === null || actual === null) {
    throw new Error(`At ${path || "root"}: Expected ${expected}, but got ${actual}`);
  }

  // Compare primitives
  if (typeof expected !== "object" && typeof actual !== "object") {
    if (expected !== actual) {
      throw new Error(
        `At ${path || "root"}: Values don't match`
          + (options.verbose ? `. Expected: ${JSON.stringify(expected)}. Actual: ${JSON.stringify(actual)}` : ""),
      );
    }
    return;
  }

  // Check if both are arrays or both are objects
  if (Array.isArray(expected) !== Array.isArray(actual)) {
    throw new Error(`At ${path || "root"}: Type mismatch - one is array, other is object`);
  }

  if (Array.isArray(expected)) {
    // Compare arrays
    if (expected.length !== actual.length) {
      throw new Error(
        `At ${path || "root"}: Array length mismatch`
          + (options.verbose ? `. Expected: ${expected.length}. Actual: ${actual.length}` : ""),
      );
    }

    expected.forEach((item, index) => {
      compareJSON(item, actual[index], options, `${path}[${index}]`);
    });
  } else {
    // Compare objects
    const expectedKeys = Object.keys(expected).sort();
    const actualKeys = Object.keys(actual).sort();

    if (expectedKeys.length !== actualKeys.length) {
      throw new Error(
        `At ${path || "root"}: Different number of properties`
          + (options.verbose ? `. Expected: ${expectedKeys.length}. Actual: ${actualKeys.length}` : ""),
      );
    }

    for (let i = 0; i < expectedKeys.length; i++) {
      if (expectedKeys[i] !== actualKeys[i]) {
        throw new Error(
          `At ${path || "root"}: Property name mismatch`
            + (options.verbose
              ? `. Expected: ${JSON.stringify(expectedKeys[i])}. Actual: ${JSON.stringify(actualKeys[i])}`
              : ""),
        );
      }
    }

    expectedKeys.forEach((key) => {
      compareJSON(expected[key], actual[key], options, path ? `${path}.${key}` : key);
    });
  }
}
