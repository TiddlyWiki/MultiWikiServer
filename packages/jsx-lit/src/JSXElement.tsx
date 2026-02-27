import EventEmitter from 'events';
import { LitElement, PropertyDeclaration, PropertyValues, ReactiveElement } from 'lit';
import { render } from '@tiddlywiki/jsx-runtime';
import { Subscription } from 'rxjs';
import { observeResize, unobserveResize } from './resizeObserver';
import { Dispatch, SetStateAction } from 'react';

ReactiveElement.enableWarning?.('async-perform-update');

interface EventMapTarget {
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

export interface JSXElement {
  addEventListener<K extends keyof MyCustomEvents>(type: K, listener: (this: JSXElement, ev: MyCustomEvents[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof MyCustomEvents>(type: K, listener: (this: JSXElement, ev: MyCustomEvents[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}


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


  protected useEventListener<T extends EventMapTarget>(
    target: T
  ): T["addEventListener"];
  protected useEventListener<T extends Record<string, any[]>, K extends keyof T>(
    target: EventEmitter<T>, type: K, listener: (...ev: T[K]) => any
  ): void;
  protected useEventListener(...args: any[]): any {
    const target = args[0] as (EventMapTarget | EventEmitter<any>);
    const inner = (type: string, listener: (...args: any[]) => void) => {
    const state = this.protectHook<{
        target?: EventMapTarget | EventEmitter,
      type?: string,
        listener?: (...args: any[]) => void,
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
    if (args.length === 1) {
      return inner;
    } else {
      return inner(args[1], args[2]);
    }
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

  protected useCallback(fn: () => () => void, deps: any[] = []) {
    const state = this.protectHook<{
      callback: () => void,
      deps?: any[]
    }>(this.useCallback, () => ({
      callback: fn(),
      deps: deps
    }));

    if (checkDeps(state.deps, deps)) {
      state.callback();
      this.useArraySubs.remove(state.callback);
      state.callback = fn();
      state.deps = deps;
      this.useArraySubs.add(state.callback);
    }
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
    this.requestUpdate();
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


