/* eslint-disable */
import {
  ElementProps,
  JSXElementProps,
  NonBooleanPrimitive,
  VElement
} from "./types.js";

declare global {
  namespace JSX {
    // type ElementType = React.JSX.ElementType;
    // interface Element extends React.JSX.Element { }
    // interface ElementClass extends React.JSX.ElementClass { }
    // interface ElementAttributesProperty extends React.JSX.ElementAttributesProperty { }
    // interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute { }
    // type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
    // interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes { }
    // interface IntrinsicClassAttributes<T> extends React.JSX.IntrinsicClassAttributes<T> { }
    // interface IntrinsicElements extends React.JSX.IntrinsicElements { }
    /**
     * Common attributes available to all elements
     */
    interface IntrinsicAttributes {
      key?: NonBooleanPrimitive;
    }

    /**
     * Base interface for JSX elements
     */
    interface Element extends VElement {
      type: string;
      props: ElementProps;
    }
    type ElementEvents<T extends Node> = T extends { __jsx_events__: infer E } ? E : never;
    type ElementProps2<T extends Node> = T extends { __jsx_props__: infer P } ? P : never;


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
    }> & JSXElementProps & {
      [K in keyof ElementEvents<T> as `on${string & K}`]?: (event: ElementEvents<T>[K]) => void;
    } & {
      [K in keyof ElementProps2<T>]?: ElementProps2<T>[K];
    }

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

    /**
     * Intrinsic elements interface - can be augmented by consumers
     */
    interface IntrinsicElements extends DOMIntrinsicElements {
      // Empty to allow merging
    }
  }
}
