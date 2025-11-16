import { setAttributes } from "./attributes.js";
import { SVG_NAMESPACE } from "./constants.js";
import { VElement, WebJSXManagedElement } from "./types.js";
import {
  assignRef,
  isVElement,
  setWebJSXChildNodeCache,
  setWebJSXProps,
} from "./utils.js";

/**
 * Creates a real DOM node from a virtual node representation.
 * @param velement Virtual node to convert
 * @param parentNamespaceURI Namespace URI from parent element, if any
 * @returns Created DOM node
 */
export function createDOMElement(
  velement: VElement,
  parentNamespaceURI?: string
): Node {
  const namespaceURI =
    velement.props.xmlns !== undefined
      ? (velement.props.xmlns as string)
      : velement.type === "svg"
        ? SVG_NAMESPACE
        : parentNamespaceURI ?? undefined;

  const el =
    typeof velement.type === "function" ?
      new (velement.type as CustomElementConstructor)() :
      velement.props.is !== undefined
        ? namespaceURI !== undefined
          ? document.createElementNS(namespaceURI, velement.type, {
            is: velement.props.is,
          })
          : document.createElement(velement.type, {
            is: velement.props.is,
          })
        : namespaceURI !== undefined
          ? document.createElementNS(namespaceURI, velement.type)
          : document.createElement(velement.type);

  if (velement.props) {
    setAttributes(el, velement.props, typeof velement.type === "function");
  }

  if (velement.props.key !== undefined) {
    (el as WebJSXManagedElement).__webjsx_key = velement.props.key;
  }

  if (velement.props.ref) {
    assignRef(el, velement.props.ref);
  }

  if (velement.props.children && !velement.props.dangerouslySetInnerHTML) {
    const children = velement.props.children;

    const nodes: Node[] = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      const node = isVElement(child)
        ? createDOMElement(child, namespaceURI)
        : document.createTextNode(`${child}`);

      nodes.push(node);
      el.appendChild(node);
    }

    setWebJSXProps(el, velement.props);
    setWebJSXChildNodeCache(el, nodes);
  }

  return el;
}
