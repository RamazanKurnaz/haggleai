// @ts-check

/**
 * Minimal no-op Cart Transform function for development.
 * This avoids large wasm sizes and crypto dependencies while
 * letting the rest of the app (chat + admin) be tested.
 *
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @param {RunInput} _input
 * @returns {FunctionRunResult}
 */
export function run(_input) {
  // For now, do nothing. The prices will remain unchanged.
  return { operations: [] };
}


