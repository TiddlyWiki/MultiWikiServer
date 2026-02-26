import { MaybeArray } from "./jsx-utils";

export const JSXElementSymbol: unique symbol = Symbol("__is_jsx_element__");

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const MATH_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const OldPropsSymbol: unique symbol = Symbol("__old_props__");
const KeyChildren: unique symbol = Symbol("__key_children__");
const OwnKeySymbol: unique symbol = Symbol("__own_key__");
const DOMElementSymbol: unique symbol = Symbol("__dom_element__");

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const callbacks = observerCallbacks.get(mutation.target as Element);
    if (callbacks) for (const cb of callbacks) cb();
  }
});

const observerCallbacks = new WeakMap<Element, (() => void)[]>();

export function render(root: Element | DocumentFragment, child: MaybeArray<JSX.Node>) {
  updateChildren(root, [child].flat(Infinity) as JSX.Node[]);
}
/*
KNOWN OR PREDICTED ISSUES:
- Event listeners are not properly removed if the element is moved.
- Attributes set to non-string values (objects, arrays) are stringified.
*/
export function updateElement(
  jsx: JSX.Element,
  el: (Element & {
    [OldPropsSymbol]?: Record<string, unknown>;
    [OwnKeySymbol]?: JSX.KeyPrimitive;
    [KeyChildren]?: Map<string, Element>;
    [DOMElementSymbol]?: boolean;
  }) | null,
  parentNamespaceURI: string | null
): Element {
  if (!el || !isNodeTypeValidUpdate(el, jsx, el.namespaceURI)) {
    const namespaceURI = jsx.props.xmlns
      ? (jsx.props.xmlns as string)
      : jsx.type === "svg"
        ? SVG_NAMESPACE
        : parentNamespaceURI ?? null;

    if (el?.[OldPropsSymbol]?.["webjsx-debugger"]) debugger;
    if (jsx.props["webjsx-debugger"]) debugger;
    // if (el?.tagName === "SLOT") debugger;
    el = (typeof jsx.type === "function" ?
      new (jsx.type as CustomElementConstructor)() :
      namespaceURI !== null
        ? document.createElementNS(namespaceURI, jsx.type.toLowerCase())
        : document.createElement(jsx.type.toLowerCase())) as typeof el & {};
  }
  observerCallbacks.delete(el);
  if (jsx.props) {
    if (typeof jsx.type === "function") {
      (el as any).props = jsx.props;
      updateAttributes(jsx.props, el, (key) => [
        "className", "class", "style", "slot", "id"
      ].includes(key) || key.startsWith("webjsx-"));
    } else {
      updateAttributes(jsx.props, el);
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
  if (!jsx.props["webjsx-donotdescend"])
    updateChildren(el, jsx.props.children);

  return el;
}
function updateAttributes(
  props: Record<string, unknown>,
  el: Element & { [OldPropsSymbol]?: Record<string, unknown>; },
  filter: ((key: string, value: unknown) => boolean) | null = null
) {
  const oldProps = (el as any)[OldPropsSymbol] || {};
  el[OldPropsSymbol] = props;
  for (let [key, value] of Object.entries(props)) {
    if (["children", "key", "ref", "xmlns", "webjsx-debugger"].includes(key)) continue;
    if (key === "className") key = "class";
    if (filter && !filter(key, value)) continue;
    if (key.startsWith("webjsx-attr-")) key = key.slice("webjsx-attr-".length);
    else if (key.startsWith("webjsx-watch-")) {
      key = key.slice("webjsx-watch-".length);
      const descriptor = value;
      value = descriptor
        && typeof descriptor === "object"
        && "get" in descriptor
        && typeof descriptor.get === "function"
        ? descriptor.get?.()
        : undefined;
      observer.observe(el, { attributes: true });
      if (!observerCallbacks.has(el)) observerCallbacks.set(el, []);
      observerCallbacks.get(el)!.push(() => {
        if (descriptor
          && typeof descriptor === "object"
          && "set" in descriptor
          && typeof descriptor.set === "function") descriptor.set?.(el.getAttribute(key));
      });
    }
    if ([undefined, null, false].includes(value as any)) {
      el.removeAttribute(key);
    } else if (["string", "number", "boolean"].includes(typeof value)) {
      el.setAttribute(key, value === true ? "" : String(value));
    } else if (key.startsWith("on") && typeof value === "function"
      || key.startsWith("webjsx-on-") && typeof value === "function") {
      if (oldProps[key] === value) continue;
      const eventName = key.slice(2).toLowerCase();
      el.removeEventListener(eventName, oldProps[key] as EventListener);
      el.addEventListener(eventName, value as EventListener);
    } else {
      console.warn(`Unsupported prop type for key "${key}": `, value);
    }
  }
  for (let [key, value] of Object.entries(oldProps)) {
    if (!(key in props)) {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        el.removeEventListener(eventName, oldProps[key] as EventListener);
      } else {
        el.removeAttribute(key);
      }
    }
  }
}
function updateChildren(
  el: (DocumentFragment | Element) & {
    [OldPropsSymbol]?: Record<string, unknown>;
    [OwnKeySymbol]?: JSX.KeyPrimitive;
    [KeyChildren]?: Map<JSX.KeyPrimitive, Element>;
    [DOMElementSymbol]?: boolean;
    namespaceURI?: string | null;
  },
  children?: JSX.Node[]
) {

  if (children?.length) {

    const curKeyMap: Map<JSX.KeyPrimitive, Element> = el[KeyChildren] ?? new Map();
    const newKeyMap = el[KeyChildren] = new Map<JSX.KeyPrimitive, Element>();
    // const ordered = new Array<{ curChildNode: ChildNode | null; newChildNode: ChildNode; }>(children.length);
    const newChildNodes = new Array<ChildNode | string>(children.length);
    for (let i = 0; i < children.length; i++) {
      const newChildDef = children[i];
      const curChildNode: (ChildNode & {
        [OwnKeySymbol]?: JSX.KeyPrimitive;
        [DOMElementSymbol]?: boolean;
      }) | null = (el?.childNodes[i]) ?? null;
      let newChildNode: ChildNode | string | undefined;
      if (isJSXDOMElement(newChildDef)) {
        newChildNode = newChildDef;
        (newChildNode as any)[DOMElementSymbol] = true;
        if ((newChildNode as any)[OwnKeySymbol]
          && curKeyMap.get((newChildNode as any)[OwnKeySymbol])?.parentElement === el)
          console.warn("jsx child node had a key and may have conflicting lookups");
      } else if (isJSXElement(newChildDef)) {
        // the first and third if blocks are the same
        // if the key of both is null or undefined, that match is correct
        if (newChildDef.key === curChildNode?.[OwnKeySymbol]) {
          newChildNode = updateElement(
            newChildDef,
            isValidCurChildNode(curChildNode) ? curChildNode : null,
            el.namespaceURI ?? null
          );
        } else if (hasKey(newChildDef) && curKeyMap.has(newChildDef.key)) {
          const keyChildNode = curKeyMap.get(newChildDef.key);
          const isChild = keyChildNode && keyChildNode.parentNode === el;
          const isDOM = keyChildNode && DOMElementSymbol in keyChildNode && keyChildNode[DOMElementSymbol] === true;
          newChildNode = updateElement(
            newChildDef,
            (isChild && !isDOM) ? (keyChildNode as Element) : null,
            el.namespaceURI ?? null
          );
        } else {
          newChildNode = updateElement(
            newChildDef,
            isValidCurChildNode(curChildNode) ? curChildNode : null,
            el.namespaceURI ?? null
          );
        }
        if (hasKey(newChildDef)) {
          //TODO: add warning with ancestor info, etc.
          if (newKeyMap.has(newChildDef.key))
            console.warn("Duplicate key detected:", newChildDef.key, newChildDef);

          else
            newKeyMap.set(newChildDef.key, newChildNode as Element);
        }
      } else if (newChildDef === null || newChildDef === undefined || newChildDef === false) {
        newChildNode = "";
      } else {
        newChildNode = `${newChildDef} `;
      }
      newChildNodes[i] = newChildNode;
    }
    replaceChildren(el, newChildNodes);
  } else {
    replaceChildren(el, []);
  }
}
function isValidCurChildNode(e: (ChildNode & {
  [OwnKeySymbol]?: JSX.KeyPrimitive;
  [DOMElementSymbol]?: boolean;
}) | null): e is Element & typeof e {
  return !!e && e.nodeType === e.ELEMENT_NODE && !e[DOMElementSymbol];
}
function hasKey(newChildDef: JSX.Element) {
  return typeof newChildDef.key === "string" || typeof newChildDef.key === "number";
}
function replaceChildren(el: ParentNode, newChildNodes: (ChildNode | string)[]) {
  const removed = new Set<ChildNode>();
  for (let i = 0, j = 0; i < newChildNodes.length; i++) {
    const newChildNode = typeof newChildNodes[i] === "string"
      ? document.createTextNode(newChildNodes[i] as string)
      : (newChildNodes[i] as ChildNode);
    removed.delete(newChildNode);
    if (!newChildNode) continue;
    const curChildNode = el.childNodes[j];
    if (newChildNode === curChildNode
      || newChildNode && curChildNode
      && newChildNode.nodeType === newChildNode.TEXT_NODE
      && curChildNode.nodeType === curChildNode.TEXT_NODE
      && newChildNode.textContent === curChildNode.textContent) { j++; continue; }
    if (curChildNode) {
      const oldChildNode = el.replaceChild(newChildNode, curChildNode);
      if (oldChildNode !== newChildNode) removed.add(oldChildNode);
    } else {
      el.appendChild(newChildNode);
    }
    j++;
  }
  while (el.childNodes.length > newChildNodes.length) {
    observerCallbacks.delete(el.lastChild as Element);
    el.removeChild(el.lastChild!);
  }
  removed.forEach((node) => {
    if (node.parentElement === el)
      throw new Error("Node to be removed is still a child of the parent.");
    observerCallbacks.delete(node as Element);
  });
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


function isJSXElement(newChildDef: JSX.Node): newChildDef is JSX.Element {
  if (!newChildDef) return false;
  return typeof newChildDef === "object" && "$$type" in newChildDef && newChildDef.$$type === JSXElementSymbol;
}
function isJSXDOMElement(newChildDef: JSX.Node): newChildDef is Element {
  if (!newChildDef) return false;
  return typeof newChildDef === "object" && newChildDef instanceof Element;
}
function isDOMText(e: Node | null): e is Text {
  return !!e && e.nodeType === e.TEXT_NODE;
}
function flattenArrayRecursive<T>(_arr: MaybeArray<T>[]): T[] {
  let arr = _arr as any[], len = 0;
  while (arr.length !== len) {
    len = arr.length;
    arr = arr.flat(10);
  }
  return arr;
}
