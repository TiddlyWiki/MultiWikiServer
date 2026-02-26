import type * as htmljsx from 'html-jsx';
import { JSXElementSymbol } from "./jsx-render";
import { MaybeArray, MaybeArrayDeep, is } from "./jsx-utils";
export { render, updateElement } from "./jsx-render";
export * from "./jsx-utils";

export const Fragment = () => {
  throw new Error("Fragment is a placeholder and should not be called directly.");
};

type DOMElement = Element;

//@ts-expect-error - CustomElements must not be declared inside the JSX namespace.
type ERROR_CustomElements_MUST_NEVER_EXIST = JSX.CustomElements;

declare global {
  export interface MyCustomElements { }
  export interface MyCustomEvents extends HTMLElementEventMap { }
  /**
   * The JSX namespace defines the types for JSX elements, attributes, and event handlers.
   * 
   * ```
   * declare global {
   *   interface MyCustomElements {
   *     'mws-app': JSX.SimpleAttrs<{
   *       test: string;
   *     }, App>;
   *   }
   * }
   * ```
   */
  export namespace JSX {
    export type KeyPrimitive = symbol | string | number | null | undefined;
    /** DOM elements passed directly as children will be inserted, not cloned. */
    export type Node = JSX.Element | JSX.Primitive | DOMElement;
    export type Primitive = string | number | boolean | null | undefined;
    export type Ref<T extends Element = Element> = (e: T) => void;

    export interface Element {
      $$type: typeof JSXElementSymbol;
      type: string | Function;
      props: { children?: JSX.Node[]; } & Record<string, unknown>;
      key?: KeyPrimitive;
    }

    export interface EventHandler<T extends DOMElement, E extends Event> extends htmljsx.EventHandler<T, E> { }
    /** 
     * Restricts what element types are allowed. 
     * 
     * Lowercase first letter gets converted to a string by JSX.
     * 
     * Uppercase first letter is expected to be a reference.
     * 
     * We use HTMLElement here only, because elsewhere the types also include the string resolved types.
     */
    export type ElementType = string | { new(): HTMLElement };
    export interface ElementClass extends DOMElement { }
    export interface ElementAttributesProperty { props: IntrinsicAttributes; }
    export interface ElementChildrenAttribute { children: {}; }

    export type IntrinsicWatchAttributes = {
      [K in `webjsx-watch-${string}`]?: { get?(): string | null; set?(value: string | null): void; }
    }
    export interface IntrinsicAttributes {
      key?: KeyPrimitive;
      children?: MaybeArrayDeep<JSX.Node>;
      style?: string;
      className?: string;
      class?: string;
      slot?: string;
      id?: string;
    }

    export interface BaseAttrs<E extends DOMElement> extends
      IntrinsicWatchAttributes,
      IntrinsicAttributes,
      Internal.JSXEventsMap<MyCustomEvents, E>,
      Omit<htmljsx.HTMLAttributes<E>, Internal.IgnoredProperties>,
      Internal.WebjsxAttrString {
      ref?: (e: E) => void;
    }

    export type SimpleAttrs<T, E extends DOMElement> =
      & Internal.AddWatched<{ [P in keyof T as P extends Internal.IgnoredProperties ? never : P]?: Extract<T[P], Primitive> }>
      & BaseAttrs<E>;

    /** 
     * For lowercase (tag names), BOTH simple and custom, C is `(props: P) => JSX.Element`. 
     * For uppercase (references), C is the constructor type, 
     * whether that's a class or a function. 
     * 
     * It's useful for accessing static members.
     */
    export type LibraryManagedAttributes<C, P> =
      C extends { new(): infer E extends HTMLElement }
      ? P & IntrinsicAttributes & { ref?: (e: E) => void; }
      : P;
    /** 
     * lowercase tags and function types do not use this. 
     * For class types this is the instance type. 
     */
    export interface IntrinsicClassAttributes<T extends DOMElement> { }

    // export interface HTMLAttributes<E extends HTMLElement> extends htmljsx.HTMLAttributes<E> { }
    // export interface DOMAttributes<E extends HTMLElement> extends htmljsx.DOMAttributes<E> { }
    // export interface SVGAttributes<E extends HTMLElement> extends htmljsx.SVGAttributes<E> { }



    // properties specific to Reference 
    // export interface IntrinsicClassAttributes<T extends ElementClass>
    //   extends IntrinsicAttributes<T>,
    //   ToAttr<htmljsx.HTMLAttributes<T>> { }

    /** 
     * This interface is expected to conform to the following format.
     * 
     * ```ts
     * { [tagName: string]: { 
     *   [attrName: `on${string}`]?: EventHandler
     *   [attrName: string]?: string | number | boolean | null | undefined 
     * }}
     * ```
     * 
     * `webjsx-watch-${keyof T}` and `webjsx-attr-${string}` are added automatically
     * 
     * types set for `"style"`, `"class"`, `"className"`, `"children"`, `"key"`, `"xmlns"`, `"slot"`, and `"id"` are ignored
     * 
     * type set for `"ref"` will be used for `Ref<T>`
     * 
     * all attributes are always optional
     * 
     */

    export interface IntrinsicElements extends MyCustomElements { }
    export interface IntrinsicElements extends Internal.ElementsModified<htmljsx.IntrinsicElements> { }
    export interface IntrinsicElements extends Internal.IconElements { }


    namespace Internal {



      type IgnoredProperties = "slot" | "id" | "style" | "class" | "className" | "children" | "key" | "ref" | "xmlns" | `on${string}`;



      /**
       * T extends { [tagName: string]: { [attributeName: string]: string; }}
       */
      type ElementsModified<T> = {
        [K in keyof T]:
        T[K] extends htmljsx.DOMAttributes<infer E extends DOMElement> ? SimpleAttrs<T[K], E> :
        T[K] extends { ref?: (e: infer E extends DOMElement) => any } ? SimpleAttrs<T[K], E> :
        K extends keyof HTMLElementTagNameMap ? SimpleAttrs<T[K], HTMLElementTagNameMap[K]> :
        SimpleAttrs<T[K], DOMElement>;
      }




      type WebjsxAttrString = { [K in `webjsx-attr-${string}`]?: string };

      type AddWatched<T> = T
        & {
        [K in `webjsx-watch-${string & keyof T}`]?:
        K extends `webjsx-watch-${infer U extends string & keyof T}`
        ? { get?(): T[U]; set?(value: T[U]): void; }
        : never;
      }

      type ToAttr<T> = {
        [P in `webjsx-attr-${string & keyof T} ` as P extends `webjsx-attr-on${string} ` ? never : P]?:
        Primitive;
      } & {
        [P in `webjsx-attr-${string & keyof T} ` as P extends `webjsx-attr-on${string} ` ? P : never]?:
        T[P extends `webjsx-attr-${infer U extends string & keyof T} ` ? U : never];
      }

      type IconElements = {
        [K in keyof HTMLElementTagNameMap as K extends `mdui-icon-${string}` ? K : never]:
        htmljsx.HTMLAttributes<HTMLElementTagNameMap[K]>
      };

      type JSXEventsMap<EV extends object, T extends DOMElement> = {
        [K in `on${string & keyof EV}`]?:
        EventHandler<T, Extract<EV[K extends `on${infer E extends string & keyof EV}` ? E : never], Event>>;
      }

    }

  }
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
  key: JSX.KeyPrimitive
): MaybeArray<JSX.Node> {

  props ??= {};

  if (!Array.isArray(props.children))
    props.children = [props.children];
  else
    props.children = props.children.flat(Infinity);
  // fix types
  if (!is<{ children: any[] }>(props, true)) throw new Error();

  if (type === Fragment) return props.children;

  if (typeof type === "string") type = type.toUpperCase();

  return { $$type: JSXElementSymbol, type, props, key };

}

/**
 * JSX transform factory for elements with multiple children.
 * Functionally identical to jsx() in this implementation.
 */
export function jsxs(
  type: string | Function,
  props: Record<string, unknown> | null,
  key: JSX.KeyPrimitive
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
  key: JSX.KeyPrimitive
) {
  return jsx(type, props, key);
}
