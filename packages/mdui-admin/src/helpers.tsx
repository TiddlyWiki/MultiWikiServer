import { customElement } from "lit/decorators.js";
import { addstyles } from "./utils/addstyles";
import { JSXElement } from "./utils/JSXElement";


declare global {
  interface MyCustomElements {
    "display-content": JSX.SimpleAttrs<{}, DisplayContent>;
  }
}

@addstyles(`:host{ display: contents; }`)
@customElement("display-content")
export class DisplayContent extends JSXElement {}