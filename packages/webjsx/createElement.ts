import { KNOWN_ELEMENTS } from "./elementTags.js";
import {
  Fragment,
  JSXChildTypes,
  NonBooleanPrimitive,
  VNode,
} from "./types.js";
import { flattenVNodes } from "./utils.js";

// As called from jsx-runtime.jsx function.
export function createElementJSX(
  type: string | typeof Fragment | CustomElementConstructor,
  props: { [key: string]: unknown } | null,
  key?: NonBooleanPrimitive
): VNode | VNode[] {
  props = props || {}
  if (key !== undefined) { props.key = key; }
  setChildrenProp(props);
  if (typeof type === "string") {

    const result: VNode = {
      type,
      tagName: KNOWN_ELEMENTS.get(type) ?? type.toUpperCase(),
      props: props ?? {},
    } as VNode;
    return result;
  } else if (is<typeof Fragment>(type, type === Fragment)) {
    return flattenVNodes(props.children as JSXChildTypes) as VNode[];
  } else if (typeof type === "function") {
    const tagName = customElements.getName(type);
    if (!tagName) throw new Error(`Custom element not registered: ${type.name}`);
    setChildrenProp(props);
    const result: VNode = {
      type,
      tagName,
      props: props ?? {},
    };
    return result;
  } else {
    throw new Error(`Invalid element type: ${type}`);
  }
}

export {createElementJSX as createElement};

function setChildrenProp(props: { [key: string]: unknown; }) {
  const flatChildren: VNode[] = flattenVNodes(props.children as JSXChildTypes);
  if (flatChildren.length > 0) {
    // Set children property only if dangerouslySetInnerHTML is not present
    if (!props.dangerouslySetInnerHTML) {
      props.children = flatChildren;
    } else {
      props.children = [];
      console.warn(
        "WebJSX: Ignoring children since dangerouslySetInnerHTML is set."
      );
    }
  } else {
    props.children = [];
  }
}

function is<T>(a: any, b: any): a is T { return !!b; }