import { PropertyDeclaration, ReactiveElement } from 'lit';
import { NullableListFilter } from 'prisma-client/client';
import * as webjsx from 'webjsx';

export class JSXElement<
  E extends Record<string, Event>
> extends ReactiveElement {
  protected update(changedProperties) {
    const tree = this.render();
    super.update(changedProperties);
    if (this.shadowRoot)
      webjsx.applyDiff(this.shadowRoot, tree ?? []);
  }
  protected render(): webjsx.VNode | webjsx.VNode[] | null {
    return <slot></slot>;
  }

  protected __jsx_events__: E;

}

declare module '@mdui/shared/base/mdui-element.js' {
  interface MduiElement<E> {
    /** Virtual element that isn't actually defined. */
    __jsx_events__: E;
  }
}
