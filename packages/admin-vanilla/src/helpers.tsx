import { addstyles, customElement, JSXElement } from "@tiddlywiki/jsx-lit";



declare global {
  interface MyCustomElements {
    "display-content": JSX.SimpleAttrs<{}, DisplayContent>;
  }
}

@addstyles(`:host{ display: contents; }`)
@customElement("display-content")
export class DisplayContent extends JSXElement {}