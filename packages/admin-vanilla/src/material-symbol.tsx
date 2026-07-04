import { customElement, JSXElement, addstyles, state } from "@tiddlywiki/jsx-lit";

// import icon1 from "@material-symbols/svg-400/{style}/{icon}.svg" // (Unfilled)
// import icon2 from "@material-symbols/svg-400/{style}/{icon}-fill.svg" // (Filled)
// <MaterialSymbol icon={icon} />
@customElement("material-symbol")
export class MaterialSymbol extends JSXElement {
  useLightDOM: boolean = true;

  @state() accessor props!: {
    icon: string;
  }

  protected render() {
    this.innerHTML = this.props.icon;
    return JSXElement.DO_NOT_RENDER;
  }
}
