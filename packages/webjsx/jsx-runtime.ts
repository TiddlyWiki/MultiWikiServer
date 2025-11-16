import { createElementJSX } from "./createElement.js";
import { Fragment, NonBooleanPrimitive } from "./types.js";
export * from "./jsx.js";

export { Fragment };

/**
 * JSX transform factory function.
 * @param type Element type or component
 * @param props Element properties
 * @param key Optional key for element identification
 * @returns Virtual element
 */
export function jsx(
  type: string | typeof Fragment,
  props: {
    [key: string]: unknown;
  } | null,
  key: NonBooleanPrimitive
) {
  return createElementJSX(type, props, key);
}

/**
 * JSX transform factory for elements with multiple children.
 * Functionally identical to jsx() in this implementation.
 */
export function jsxs(
  type: string | typeof Fragment,
  props: {
    [key: string]: unknown;
  } | null,
  key: NonBooleanPrimitive
) {
  return jsx(type, props, key);
}

/**
 * Development mode JSX transform factory.
 * Currently identical to jsx() in this implementation.
 */
export function jsxDEV(
  type: string | typeof Fragment,
  props: {
    [key: string]: unknown;
  } | null,
  key: NonBooleanPrimitive
) {
  return jsx(type, props, key);
}

export const JSXFragment = Fragment;
