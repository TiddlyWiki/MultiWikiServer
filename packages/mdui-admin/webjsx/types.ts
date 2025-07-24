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
 */
export type Ref<T extends Node = Node> =
  | ((node: T | null) => void)
  | { current: T | null };

/**
 * Properties that can be applied to elements.
 */
export interface ElementPropsBase<TChildTypes> {
  [key: string]: unknown;
  is?: string;
  xmlns?: string;
  class?: string;
  children?: TChildTypes;
  key?: NonBooleanPrimitive;
  dangerouslySetInnerHTML?: { __html: string };
  ref?: Ref<Node>;
}

export type JSXElementProps = ElementPropsBase<JSXChildTypes>;
export type ElementProps = ElementPropsBase<VNode[] | null>;

export type VElement = {
  type: string;
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
  __webjsx_key?: NonBooleanPrimitive;
  __webjsx_props: ElementProps;
  __webjsx_listeners: {
    [name: string]: EventListenerOrEventListenerObject;
  };
  __webjsx_childNodes?: Node[];
} & Element;
