import { HTML_NAMESPACE } from "./constants.js";
import {
  ElementProps,
  JSXChildTypes,
  NonBooleanPrimitive,
  Ref,
  VElement,
  VNode,
  WebJSXManagedElement,
} from "./types.js";

/**
 * Flattens nested virtual nodes by replacing Fragments with their children.
 * @param vnodes Virtual nodes to flatten
 * @returns Array of flattened virtual nodes
 */
export function flattenVNodes(
  vnodes: JSXChildTypes,
  result: VNode[] = []
): VNode[] {
  if (Array.isArray(vnodes)) {
    for (const vnode of vnodes) {
      flattenVNodes(vnode, result);
    }
  } else if (isValidVNode(vnodes)) {
    result.push(vnodes);
  }

  return result;
}

export function isValidVNode(
  vnode: VNode | boolean | null | undefined
): vnode is VNode {
  const typeofVNode = typeof vnode;
  return (
    vnode !== null &&
    vnode !== undefined &&
    (typeofVNode === "string" ||
      typeofVNode === "object" ||
      typeofVNode === "number" ||
      typeofVNode === "bigint")
  );
}

/* Get Child Nodes Efficiently */
export function getChildNodes(parent: Node): Node[] {
  const nodes: Node[] = [];
  let current: Node | null = parent.firstChild;

  while (current) {
    nodes.push(current);
    current = current.nextSibling;
  }

  return nodes;
}

/**
 * Assigns a ref to a DOM node.
 * @param node Target DOM node
 * @param ref Reference to assign (function or object with current property)
 */
export function assignRef(node: Node, ref: Ref): void {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref && typeof ref === "object") {
    ref.current = node;
  }
}

export function isVElement(vnode: VNode): vnode is VElement {
  const typeofVNode = typeof vnode;
  return (
    typeofVNode !== "string" &&
    typeofVNode !== "number" &&
    typeofVNode !== "bigint"
  );
}

export function isNonBooleanPrimitive(
  vnode: VNode
): vnode is NonBooleanPrimitive {
  const typeofVNode = typeof vnode;

  return (
    typeofVNode === "string" ||
    typeofVNode === "number" ||
    typeofVNode === "bigint"
  );
}

export function getNamespaceURI(node: Node): string | undefined {
  return node instanceof Element && node.namespaceURI !== HTML_NAMESPACE
    ? node.namespaceURI ?? undefined
    : undefined;
}

export function setWebJSXProps(
  element: Element | ShadowRoot,
  props: ElementProps
) {
  (element as WebJSXManagedElement).__webjsx_props = props;
}

export function getWebJSXProps(element: Element | ShadowRoot | DocumentFragment) {
  let props = (element as WebJSXManagedElement).__webjsx_props;
  if (!props) {
    props = {};
    (element as WebJSXManagedElement).__webjsx_props = props;
  }
  return props;
}

export function setWebJSXChildNodeCache(
  element: Element | ShadowRoot | DocumentFragment,
  childNodes: Node[]
) {
  (element as WebJSXManagedElement).__webjsx_childNodes = childNodes;
}

export function getWebJSXChildNodeCache(
  element: Element | ShadowRoot | DocumentFragment
): Node[] | undefined {
  return (element as WebJSXManagedElement).__webjsx_childNodes;
}
