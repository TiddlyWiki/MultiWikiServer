/// <reference path="types.d.ts" />
import 'mdui/mdui.css';
import 'mdui';
import '@material/web/all.js';
import "./main.css";

import { customElement } from "lit/decorators.js";
import { JSXElement } from './utils/JSXElement';
import { addstyles } from './utils/addstyles';
import { setColorScheme } from 'mdui';
import "./utils/frame-slider";
import "./utils/virtual-scroller";


import main_inline_css from './main.inline.css';

import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';

document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);
// this appends a style tag to the head, so I just baked it into the html.
setColorScheme('#a45b89');
// this is the class for it
// document.documentElement.classList.add("mdui-custom-color-scheme-4278255488-0");
// `mdui-theme-${"light" | "dark" | "auto"}`
document.documentElement.classList.add("mdui-theme-auto");
// disables the "flash of white" styles
document.documentElement.classList.add("loaded");



@customElement('mws-app')
@addstyles(main_inline_css)
class App extends JSXElement<{}> {

}

setTimeout(() => {
  document.body.appendChild(new App());
});

