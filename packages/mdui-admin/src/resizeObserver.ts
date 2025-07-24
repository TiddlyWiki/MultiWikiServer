import { JSXElement } from "./JSXElement";

const listeners = new WeakMap<Element, Set<JSXElement<any>>>();
const debounces = new WeakMap<Element, any>();
const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach(entry => {
        if (debounces.has(entry.target)) clearTimeout(debounces.get(entry.target));
        debounces.set(entry.target, setTimeout(() => {
            debounces.delete(entry.target);
            const listenArr = listeners.get(entry.target) || [];
            listenArr.forEach(e => e.requestUpdate());
        }, 100));
    });
});

export const observeResize = (target: Element, listener: JSXElement<any>) => {
    const listenSet = listeners.get(target) ?? listeners.set(target, new Set()).get(target)!;
    listenSet.add(listener);
    resizeObserver.observe(target);
}
export const unobserveResize = (target: Element, listener: JSXElement<any>) => {
    const listenSet = listeners.get(target);
    if (!listenSet) return;
    listenSet.delete(listener);
    if (listenSet.size === 0) {
        resizeObserver.unobserve(target);
        listeners.delete(target);
    }
}