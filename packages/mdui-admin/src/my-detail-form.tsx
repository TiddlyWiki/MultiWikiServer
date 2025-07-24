import { css, PropertyValues } from 'lit';
import { customElement } from "lit/decorators.js";
import { JSXElement } from './JSXElement';
import { FormGroup } from './FormClasses';

declare global { interface HTMLElementTagNameMap { 'my-form': MyForm; } }
@customElement('my-form')
export class MyForm extends JSXElement<{}> {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }
    .flex-col {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot?.addEventListener('registerFormControl', this.registerFormControl);
  }

  private registerFormControl = (event: CustomEvent) => {
    const control = event.detail as FormGroup<any>;
    console.log("register", control);
    control.subscribe((value) => {

    });
  };

  protected firstUpdated(_changedProperties: PropertyValues): void {

  }

  protected render() {
    return null;
  }

}



