import { CSSResultOrNative, getCompatibleStyle, adoptStyles } from "lit";

export type ReactiveAttributeObserver<T extends ReactiveHTMLElement> = (this: T, oldV: string | null, newV: string | null) => void;
export function observed<T extends ReactiveHTMLElement>(_attributeName: string, observer?: ReactiveAttributeObserver<T>) {
  return function (
    target: ClassAccessorDecoratorTarget<any, any>,
    context: ClassAccessorDecoratorContext<ReactiveHTMLElement>
  ) {
    const attributeName = _attributeName ?? String(context.name).toLowerCase();
    console.log(target, context);
    context.metadata.attributes ??= {};
    type metadata = { attributes: Record<string, ReactiveAttributeObserver<any> | null> }
    (context.metadata as metadata).attributes[attributeName] = observer ?? null;

    return {
      get(this: ReactiveHTMLElement) {
        const attrValue = this.getAttribute(attributeName);
        // Handle type conversion based on the target type
        if (attrValue === null) return undefined as any;
        return attrValue as any;
      },
      set(this: ReactiveHTMLElement, value: any) {
        if (value == null || value === undefined) {
          this.removeAttribute(attributeName);
        } else {
          this.setAttribute(attributeName, String(value));
        }
      }
    };
  };
}

export abstract class ReactiveHTMLElement extends HTMLElement {
  static ElementStyles: CSSResultOrNative[];
  static getElementStyles(styles: string) {
    const css = new CSSStyleSheet();
    css.replaceSync(styles);
    return [getCompatibleStyle(css)];
  }
  declare static [Symbol.metadata]: any;
  static get observedAttributes(): string[] {
    // console.log(this[Symbol.metadata].attributes)
    return Object.keys(this[Symbol.metadata].attributes);
  }
  /** Called when an observed attribute changes on the element */
  protected attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    // console.log(name, oldValue, newValue);
    (this.constructor as typeof ReactiveHTMLElement)[Symbol.metadata].attributes[name]?.call(this, oldValue, newValue);
  }

  constructor() {
    super();
    this.renderRoot = this.shadowRoot ?? this.attachShadow({ mode: 'open', });
    adoptStyles(this.renderRoot, (this.constructor as typeof ReactiveHTMLElement).ElementStyles);
  }
  protected renderRoot: ShadowRoot;

  protected connectedCallback() {
    if (this.isMoving) { this.isMoving = false; return; }
  }

  protected disconnectedCallback() {
    if (this.isMoving) { return; }
  }

  protected isMoving: boolean = false;
  protected __prepareForMove() { this.isMoving = true; }
  protected adoptedCallback() { }

}
// Hi Arlen, I am stealing your computer to do some relaxing coding and I have no idea how to code. Ready, set, GO
// this.anotherAttr = NewV + " Jenny is making friends at southern market. BOOM";