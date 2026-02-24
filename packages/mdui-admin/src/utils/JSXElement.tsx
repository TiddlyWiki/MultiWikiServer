import EventEmitter from 'events';
import { PropertyValues, ReactiveElement } from 'lit';
import { render } from "@tiddlywiki/jsx-runtime";
import { Subscription } from 'rxjs';
import { observeResize, unobserveResize } from './resizeObserver';
import { Dispatch, SetStateAction } from 'react';

ReactiveElement.enableWarning?.('async-perform-update');

/**

```ts
declare global { namespace JSX { interface CustomElements { 'mdui-popup': PopupComp; } } }
\@customElement("mdui-popup")
\@addstyles(mdui_popup_inline_css)
export class BottomSheet extends JSXElement<{
  cancel: Event
}> 
```

 */
export class JSXElement extends ReactiveElement {

  protected events = new EventEmitter<{
    "willUpdate": [PropertyValues];
    "updated": [PropertyValues];
    "firstUpdated": [PropertyValues];
  }>();
  private useArray = new Map<number, any>();
  private useArrayIndex: number = 0;
  private useArrayFunc = new Map<number, Function>();
  private useArraySubs = new Subscription();
  protected resetHooks(): void {
    if (this.useArrayIndex !== 0) {
      throw new Error("resetHooks may only be called at the start of the render method.");
    }
    this.useArray.clear();
    this.useArrayIndex = 0;
    this.useArrayFunc.clear();
    this.useArraySubs.unsubscribe();
    this.useArraySubs = new Subscription();
  }
  private protectHook<T extends {}>(fn: Function, init: () => T): T {
    this.useArrayIndex++;
    let curfunc: Function | undefined;
    if (!this.useArrayFunc.has(this.useArrayIndex)) {
      this.useArrayFunc.set(this.useArrayIndex, fn);
    } else if ((curfunc = this.useArrayFunc.get(this.useArrayIndex)) !== fn) {
      throw new Error(`Expected ${curfunc!.name} to be called, but found ${fn.name}`);
    }

    const state = this.useArray.get(this.useArrayIndex);
    if (state) return state;

    const inited = init();
    this.useArray.set(this.useArrayIndex, inited);
    return inited;

  }


  protected useWillUpdate(cb: (this: this, changedProperties: PropertyValues) => void, deps?: any[]): void {
    return this.useEventListener(this.events, "willUpdate", cb.bind(this));
  }
  protected useUpdated(cb: (this: this, changedProperties: PropertyValues) => void, deps?: any[]): void {
    return this.useEventListener(this.events, "updated", cb.bind(this));
  }
  protected useFirstUpdated(cb: (this: this, changedProperties: PropertyValues) => void) {
    return this.useEventListener(this.events, "firstUpdated", cb.bind(this));
  }

  protected useEventListener<T extends EventTarget, K extends string & keyof EventTargetType<T>>(
    target: T | null | undefined, type: K, listener: (this: T, ev: EventTargetType<T>[K]) => any
  ): void;
  protected useEventListener<T extends Record<keyof T, any[]>, K extends string & keyof T>(
    target: EventEmitter<T> | null | undefined,
    type: K,
    listener: (...ev: T[K]) => any
  ): void;
  protected useEventListener(target: EventTarget | EventEmitter | null | undefined, type: string, listener: EventListener): void {

    const state = this.protectHook<{
      target?: EventTarget | EventEmitter,
      type?: string,
      listener?: EventListener,
      teardown?: () => void
      inited: boolean
    }>(this.useEventListener, () => ({ inited: false } as any));


    if (state.inited
      && Object.is(state.target, target)
      && Object.is(state.type, type)
      && Object.is(state.listener, listener)
    ) {
      return;
    }
    if (state.inited) {
      state.teardown!();
      this.useArraySubs.remove(state.teardown!);
      state.inited = false;

      state.target = undefined;
      state.type = undefined;
      state.listener = undefined;
      state.teardown = undefined;

    }
    // hook order can't change, so this allows targets to be removed.
    if (!target) return;

    state.inited = true;
    state.target = target;
    state.type = type;
    state.listener = listener;
    state.teardown = () => {
      if ("removeEventListener" in state.target!)
        state.target!.removeEventListener(state.type!, state.listener!);
      else
        state.target?.off(state.type!, state.listener!);
    }

    if ("addEventListener" in target!)
      target.addEventListener(type, listener);
    else
      target.on(type, listener);


    this.useArraySubs.add(state.teardown);
  }
  protected useObserveResize(element: HTMLElement, caller: { requestUpdate(): void } = this) {

    const state = this.protectHook<{
      teardown: () => void
      element?: HTMLElement
    }>(this.useObserveResize, () => ({} as any));

    if (state.element) {
      if (Object.is(state.element, element)) return;
      this.useArraySubs.remove(state.teardown);
      state.teardown();
    }
    observeResize(element, caller);
    state.element = element;
    state.teardown = () => { unobserveResize(element, caller); }
    this.useArraySubs.add(state.teardown);


  }

  protected useState<T>(initialValue: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] {

    const state = this.protectHook<{
      value: T,
      setValue: Dispatch<SetStateAction<T>>
    }>(this.useState, () => ({
      value: typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue,
      setValue: (newValue: T | ((prev: T) => T)) => {
        const nextValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(state.value) : newValue;
        if (!Object.is(state.value, nextValue)) {
          state.value = nextValue;
          this.requestUpdate();
        }
      }
    }));

    return [state.value, state.setValue] as const;
  }



  protected useMemo<T>(fn: () => T, deps: any[] = []): T {

    const state = this.protectHook<{
      value: T,
      deps?: any[]
    }>(this.useMemo, () => ({
      value: fn(),
      deps: undefined
    }));

    if (checkDeps(state.deps, deps)) {
      state.value = fn();
      state.deps = deps;
    }

    return state.value;
  }

  protected useAsyncMemo<T>(
    fn: () => Promise<T>,
    deps: any[] = [],
  ): { value?: T; loading: boolean; error?: any } {

    const state = this.protectHook<{
      value?: T,
      loading: boolean,
      error?: any,
      deps?: any[]
    }>(this.useAsyncMemo, () => ({
      value: undefined,
      loading: false,
      error: undefined,
      deps: undefined
    }));

    if (checkDeps(state.deps, deps) && !state.loading) {
      state.loading = true;
      state.deps = deps;
      fn().then((result) => {
        state.value = result;
        state.loading = false;
        this.requestUpdate();
      }).catch((err) => {
        state.error = err;
        state.loading = false;
        this.requestUpdate();
      });
    }

    return { value: state.value, loading: state.loading, error: state.error };
  }

  protected useKey(key: JSX.KeyPrimitive): boolean {
    if (this.useArrayIndex)
      throw new Error("useKey must be called first");

    const state = this.protectHook<{
      key: JSX.KeyPrimitive
    }>(this.useState, () => ({ key }));

    if (!Object.is(state.key, key)) {
      this.useArrayIndex = 0;
      this.resetHooks();
      this.protectHook<{
        key: JSX.KeyPrimitive
      }>(this.useState, () => ({ key }));
      return true;
    } else {
      return false;
    }

  }

  protected update(changedProperties: any) {
    this.useArrayIndex = 0;
    const tree = this.render();

    if (this.useArrayIndex !== this.useArray.size) {
      throw new Error(`Expected use hooks to be called ${this.useArray.size} times, but found ${this.useArrayIndex} calls.`);
    }

    super.update(changedProperties);
    render(this.shadowRoot!, tree);
  }
  protected render(): JSX.Node {
    return <slot></slot>;
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
    this.events.emit("updated", _changedProperties);
  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    super.willUpdate(_changedProperties);
    this.events.emit("willUpdate", _changedProperties);
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.events.emit("firstUpdated", _changedProperties);
  }

  protected subs = new Subscription();

  connectedCallback(): void {
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.subs.unsubscribe();
    this.subs = new Subscription();
    this.useArrayIndex = 0;
    this.resetHooks();
  }



}

function checkDeps(oldDeps: any[] | undefined, newDeps: any[] | undefined): boolean {
  if (!oldDeps || !newDeps) return true;
  if (oldDeps.length !== newDeps.length) return true;
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], newDeps[i])) return true;
  }
  return false;
}

type EventTargetType<T extends EventTarget> =
  T extends Window ? WindowEventMap :
  T extends Document ? DocumentEventMap :
  T extends ShadowRoot ? ShadowRootEventMap :
  T extends HTMLElement ? HTMLElementEventMap :
  JSXElementEventMap;

declare module '@mdui/shared/base/mdui-element.js' {
  interface MduiElement<E> {
    /** Virtual element that isn't actually defined. */
    __jsx_events__: E;
  }
}


declare global {
  interface JSXElementEventMap {

  }

  interface ShadowRootEventMap extends JSXElementEventMap, HTMLElementEventMap { }
  interface HTMLElementEventMap extends JSXElementEventMap { }
}

