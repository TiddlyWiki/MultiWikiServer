/* eslint-disable */
import {
  ElementProps,
  JSXElementProps,
  NonBooleanPrimitive,
  Ref,
  VElement
} from "./types.js";

declare global {
  namespace JSX {
    // type ElementType = React.JSX.ElementType;
    interface Element extends VElement {
      type: any;
      props: any;
    }
    // interface Element extends React.JSX.Element {}
    // interface ElementClass extends React.JSX.ElementClass {}
    interface ElementClass extends HTMLElement { }
    interface ElementAttributesProperty { props: {}; }
    interface ElementChildrenAttribute { children: {}; }
    type LibraryManagedAttributes<C, P> = P;
    interface IntrinsicAttributes {
      key?: NonBooleanPrimitive | null | undefined;
    }
    interface IntrinsicClassAttributes<T extends Node> {
      ref?: Ref<T>;
    }
    /** Intrinsic elements interface - can be augmented by consumers */
    interface IntrinsicElements extends DOMIntrinsicElements {}
    // interface IntrinsicElements extends React.JSX.IntrinsicElements { }

    type ElementEvents<T extends Node> = T extends { __jsx_events__: infer E } ? E : never;

    

    type IgnoredProperties =
      | "connectedCallback"
      | "disconnectedCallback"
      | "children"
      | "nodes"
      | "__jsx_events__"

    /**
     * 
     * Helper type for extracting element attributes
     */
    type ElementAttributesFor<T extends Node> = Partial<{
      [K in keyof T as K extends
      | IgnoredProperties
      | `on${string & keyof ElementEvents<T>}`
      ? never : K]:
      K extends "style" ? string :
      T[K]
    }> & JSXElementProps<T> & {
      [K in keyof ElementEvents<T> as `on${string & K}`]?: (event: ElementEvents<T>[K]) => void;
    }
    // `webjsx-attr-${string}`

    /**
     * Maps HTML and SVG element types to their attribute types
     */
    type DOMIntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: ElementAttributesFor<
        HTMLElementTagNameMap[K]
      >;
    } & {
      [K in keyof SVGElementTagNameMap]: ElementAttributesFor<
        SVGElementTagNameMap[K]
      >;
    };

  }
}
