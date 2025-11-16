import { flattenVNodes } from "./utils.js";

export type JSXChildTypes =
  | VNode
  | boolean
  | null
  | undefined
  | JSXChildTypes[];

export const Fragment = (props: { children?: JSXChildTypes }): VNode[] => {
  return flattenVNodes(props.children);
};

export type FragmentType = typeof Fragment;

export type Primitive = string | number | bigint | boolean;

export type NonBooleanPrimitive = string | number | bigint;

/**
 * Reference type for DOM nodes.
 * Can be either a callback function or an object with a current property.
 * The object type is just Node so it can be used with any type of DOM node.
 */
export type Ref<T extends Node = Node> = FunctionRef<T> | ObjectRef<T>;
export type ObjectRef<T> = { current: T };
export type FunctionRef<T extends Node = Node> = (node: T | null) => void;

/**
 * Properties that can be applied to elements.
 */
export interface ElementPropsBase<TNode extends Node, TChildTypes> {
  [key: string]: unknown;
  is?: string;
  xmlns?: string;
  class?: string;
  children?: TChildTypes;
  key?: NonBooleanPrimitive;
  dangerouslySetInnerHTML?: { __html: string };
  ref?: Ref<TNode>;
  
}

export type JSXElementProps<I extends Node> = ElementPropsBase<I, JSXChildTypes>;
export type ElementProps = ElementPropsBase<Node, VNode[] | null>;

export type VElement = {
  type: string | CustomElementConstructor;
  tagName: string;
  props: ElementProps;
};

export type VNode = VElement | NonBooleanPrimitive;

/**
 * Interface for components that support render suspension.
 */
export type WebJSXAwareComponent = {
  __webjsx_suspendRendering?: () => void;
  __webjsx_resumeRendering?: () => void;
} & Element;

export type WebJSXManagedElement = {
  props: ElementProps;
  __webjsx_key?: NonBooleanPrimitive;
  __webjsx_props: ElementProps;
  __webjsx_listeners: {
    [name: string]: EventListenerOrEventListenerObject;
  };
  __webjsx_childNodes?: Node[];
  __webjsx_ref: { current: Node | null };
} & Element;
