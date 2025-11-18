interface CustomElement {

}
// starting from scratch with a new jsx implementation based on vanilla js

type attrObserver<T extends ReactiveHTMLElement> = (this: T, oldV: string | null, newV: string | null) => void;
function observed<T extends ReactiveHTMLElement>(_attributeName: string, observer: attrObserver<T>) {
  return function (
    target: ClassAccessorDecoratorTarget<any, any>,
    context: ClassAccessorDecoratorContext<ReactiveHTMLElement>
  ) {
    const attributeName = _attributeName ?? String(context.name).toLowerCase();

    context.addInitializer(function () {
      // Ensure observedAttributes array exists on the constructor
      const constructor = this.constructor as any;
      constructor.attributeObservers ??= new Map<string, attrObserver<T>>();
      if (constructor.attributeObservers.has(attributeName))
        throw new Error(`Attribute observer for '${attributeName}' is already defined on ${constructor.name}`);
      if (observer)
        constructor.attributeObservers.set(attributeName, observer);
    });

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

export class ReactiveHTMLElement extends HTMLElement {
  constructor() {
    super();
  }

  protected connectedCallback() {
    if (this.isMoving) { return; }
  }

  protected disconnectedCallback() {
    if (this.isMoving) { return; }
  }

  protected isMoving: boolean = false;
  /** 
   * Our own custom method for older browsers that tells the 
   * element not to fully disconnect and reconnect.
   */
  prepareForMove() {
    this.isMoving = true;
  }

  /** 
   * Tells the element it has been adopted into a new document. 
   * Called between disconnectedCallback and connectedCallback 
   */
  protected adoptedCallback() {

  }

  static get observedAttributes(): string[] {
    return this.attributeObservers ? Array.from(this.attributeObservers.keys()) : [];
  }


  /** Called when an observed attribute changes on the element */
  protected attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {

  }

}

class TestElement extends ReactiveHTMLElement {
  static attributeObservers: Map<string, attrObserver<TestElement>>;

  @observed<TestElement>("my-attr", function (OldV, NewV) {

  })
  private accessor myAttr: string | undefined = undefined;

  private accessor anotherAttr: string | undefined = undefined;

}