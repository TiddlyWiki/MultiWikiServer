import { JSXElement } from "@tiddlywiki/jsx-lit"
/**
 * Wraps a class accessor or setter so that `requestUpdate()` is called when the accessor is set.
 * 
 * The property name and old value are NOT passed to `requestUpdate()`.
 */
export function requestUpdate<C extends { context: JSXElement }, V>(
  target: ClassAccessorDecoratorTarget<C, V>,
  context: ClassAccessorDecoratorContext<C, V>
): ClassAccessorDecoratorResult<C, V> {
  const { kind } = context;

  if (kind === 'accessor') {
    // Standard decorators cannot dynamically modify the class, so we can't
    // replace a field with accessors. The user must use the new `accessor`
    // keyword instead.
    let value: V;
    return {
      set(v) {
        if (!Object.is(v, value)) {
          value = v;
          this.context.requestUpdate();
        }
      },
      init(v) {
        value = v;
        return v;
      },
      get() {
        return value;
      }
    };
  }
  throw new Error(`Unsupported decorator location: ${kind}`);
};
