// import * as React from "react/jsx-runtime";
import { } from "html-element-attributes";
import { Ref, is, truthy } from "./utils";
export const Fragment = () => { throw new Error("Fragment is a placeholder and should not be called directly."); };
import type * as jsxhtml from 'html-jsx'




export type KeyPrimitive = string | number | null | undefined;

type DOMElement = Element;

export namespace JSX {

  export type Primitive = string | number | boolean | null | undefined;

  export interface Element {
    $$type: typeof JSXElementSymbol;
    type: string | Function;
    props: { children: (Element | Primitive)[] } & Record<string, unknown>;
    key?: KeyPrimitive;
  }

  export interface ElementClass extends HTMLElement { }
  export interface ElementAttributesProperty { props: {}; }
  export interface ElementChildrenAttribute { children: {}; }
  export type LibraryManagedAttributes<C, P> = P;
  export interface IntrinsicAttributes {
    key?: KeyPrimitive;
  }
  export interface IntrinsicClassAttributes<T extends DOMElement> {
    ref?: Ref<T>;
  }
  export interface IntrinsicElements extends jsxhtml.IntrinsicElements {

  }

}

export const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
export const MATH_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
export const SVG_NAMESPACE = "http://www.w3.org/2000/svg";



const JSXElementSymbol: unique symbol = Symbol("__is_jsx_element__");
const OldPropsSymbol: unique symbol = Symbol("__old_props__");
const ChildKeysSymbol: unique symbol = Symbol("__child_keys__");
const OwnKeySymbol: unique symbol = Symbol("__own_key__");
const KeySetSymbol: unique symbol = Symbol("__key_set__");
const KeyArrSymbol: unique symbol = Symbol("__key_arr__");
const KeyChildren: unique symbol = Symbol("__key_children__");

function updateElement(
  jsx: JSX.Element,
  el: Element & {
    [OldPropsSymbol]?: Record<string, unknown>;
    [OwnKeySymbol]?: KeyPrimitive;
    [KeyChildren]?: Map<string, Element>;
  } | null,
  parentNamespaceURI: string | null
): Element {
  if (!el || !isNodeTypeValidUpdate(el, jsx, el.namespaceURI)) {
    const namespaceURI =
      jsx.props.xmlns
        ? (jsx.props.xmlns as string)
        : jsx.type === "svg"
          ? SVG_NAMESPACE
          : parentNamespaceURI ?? null;

    el = (typeof jsx.type === "function" ?
      new (jsx.type as CustomElementConstructor)() :
      namespaceURI !== null
        ? document.createElementNS(namespaceURI, jsx.type)
        : document.createElement(jsx.type)) as typeof el & {};
  }

  if (jsx.props) {
    if (typeof jsx.type === "function") {
      (el as any).props = jsx.props;
    } else {
      const oldProps = (el as any)[OldPropsSymbol] || {};
      el[OldPropsSymbol] = jsx.props;
      for (const [key, value] of Object.entries(jsx.props)) {
        if (["children", "key", "ref", "xmlns"].includes(key)) continue;
        if ([undefined, null, false].includes(value as any)) {
          el.removeAttribute(key);
        } else if (["string", "number", "boolean"].includes(typeof value)) {
          el.setAttribute(key, value === true ? "" : String(value));
        } else if (key.startsWith("on") && typeof value === "function") {
          if (oldProps[key] === value) continue;
          const eventName = key.slice(2).toLowerCase();
          el.removeEventListener(eventName, oldProps[key] as EventListener);
          el.addEventListener(eventName, value as EventListener);
        }
      }
    }
  }

  if (jsx.key !== undefined) {
    el[OwnKeySymbol] = jsx.key;
  }

  if (jsx.props.ref) {
    const ref = jsx.props.ref;
    if (typeof ref === "function") {
      ref(el);
    } else if (typeof ref === "object" && ref !== null) {
      (ref as { current: Element | null; }).current = el;
    }
  }

  if (jsx.props.children) {
    const children = jsx.props.children;
    const curKeyMap: Map<string, Element> = el[KeyChildren] ?? new Map();
    const newKeyMap = el[KeyChildren] = new Map<string, Element>();
    const ordered = new Array<{ curChildNode: ChildNode | null, newChildNode: ChildNode }>(children.length);
    for (let i = 0; i < children.length; i++) {
      const newChildDef = children[i];
      const curChildNode: ChildNode & {
        [OwnKeySymbol]?: KeyPrimitive;
      } | null = (el?.childNodes[i]) ?? null;
      let newChildNode: ChildNode;

      if (isJSXElement(newChildDef)) {
        if (newChildDef.key === curChildNode?.[OwnKeySymbol]) {
          newChildNode = updateElement(
            newChildDef,
            isDOMElement(curChildNode) ? curChildNode : null,
            el.namespaceURI ?? null
          );
        } else if (curKeyMap.has(curKeyMapKey(newChildDef))) {
          const keyChildNode = curKeyMap.get(curKeyMapKey(newChildDef));
          const isChild = keyChildNode && keyChildNode.parentNode === el;
          newChildNode = updateElement(
            newChildDef,
            isChild ? keyChildNode : null,
            el.namespaceURI ?? null
          );
        } else {
          newChildNode = updateElement(
            newChildDef,
            isDOMElement(curChildNode) ? curChildNode : null,
            el.namespaceURI ?? null
          );
        }
      } else {
        if (isDOMText(curChildNode)) {
          curChildNode.textContent = `${newChildDef}`;
          newChildNode = curChildNode;
        } else {
          newChildNode = document.createTextNode(`${newChildDef}`);
        }
      }
      ordered[i] = { curChildNode, newChildNode };
      if (isJSXElement(newChildDef) && newChildDef.key !== undefined) {
        newKeyMap.set(curKeyMapKey(newChildDef), newChildNode as Element);
      }
      if (newChildNode !== curChildNode) {
        el.insertBefore(newChildNode, curChildNode ?? null);
        if (curChildNode) el.removeChild(curChildNode);
      }
    }
    while (el.childNodes.length > children.length) {
      el.removeChild(el.lastChild!);
    }
  } else {
    el.innerHTML = "";
  }
  return el;
}

function isNodeTypeValidUpdate(node: Element | null, def: JSX.Element, namespace: string | null) {
  if (node === null) return false;
  return (
    typeof def.type === "string"
    && node.nodeName === def.type
    && node.namespaceURI === namespace
    || typeof def.type === "function"
    && node instanceof def.type
  );
}

function curKeyMapKey(newChildDef: JSX.Element): string {
  if (typeof newChildDef.key !== "string" && typeof newChildDef.key !== "number")
    throw new Error("Invalid key type");

  return `${newChildDef.key} ${typeof newChildDef.key as "string" | "number"}`;
}

function isJSXElement(newChildDef: JSX.Element | JSX.Primitive): newChildDef is JSX.Element {
  if (!newChildDef) return false;
  return typeof newChildDef === "object" && newChildDef.$$type === JSXElementSymbol;
}

function isDOMElement(e: Node | null): e is Element {
  return !!e && e.nodeType === e.ELEMENT_NODE
}
function isDOMText(e: Node | null): e is Text {
  return !!e && e.nodeType === e.TEXT_NODE
}

/**
 * JSX transform factory function.
 * @param type Element type or component
 * @param props Element properties
 * @param key Optional key for element identification
 * @returns Virtual element
 */
export function jsx(
  type: string | Function,
  props: Record<string, unknown> | null,
  key: KeyPrimitive
): JSX.Element | any[] {
  // console.log(typeof type, props, key);
  // return React.jsx(type as any, props as any, key as any);

  props ??= {};

  if (!Array.isArray(props.children))
    props.children = [props.children];
  else
    props.children = flattenChildren(props);
  // fix types
  if (!is<{ children: any[] }>(props, true)) throw new Error();

  if (type === Fragment) return props.children;

  if (typeof type === "string") type = type.toUpperCase();

  return { $$type: JSXElementSymbol, type, props, key };

}


function flattenChildren(props: Record<string, unknown>) {
  let arr = props.children as any[], len = 0;
  while (arr.length !== len) {
    len = arr.length;
    arr = arr.flat(10);
  }
  return arr;
}

/**
 * JSX transform factory for elements with multiple children.
 * Functionally identical to jsx() in this implementation.
 */
export function jsxs(
  type: string | Function,
  props: Record<string, unknown> | null,
  key: KeyPrimitive
) {
  return jsx(type, props, key);
}

/**
 * Development mode JSX transform factory.
 * Currently identical to jsx() in this implementation.
 */
export function jsxDEV(
  type: string | Function,
  props: Record<string, unknown> | null,
  key: KeyPrimitive
) {
  return jsx(type, props, key);
}
