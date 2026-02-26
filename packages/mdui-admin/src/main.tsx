/// <reference path="types.d.ts" />
import 'mdui/mdui.css';
import 'mdui';
// global css (not scoped)
import "./main.css";
// 
import type * as TMDUI from "mdui/jsx2.en.d.ts";
declare global {
  export interface MyCustomElements extends TMDUI.IntrinsicElements { }
}
declare module "mdui/jsx2.en.d.ts" {
  export interface IntrinsicAttributes<T extends Element> extends JSX.SimpleAttrs<{}, T> { }
}

import '@mdui/icons/leaderboard--outlined';
import '@mdui/icons/image--outlined';
import '@mdui/icons/library-music--outlined';
import '@mdui/icons/place';
import '@mdui/icons/commute';
import '@mdui/icons/people';
import '@mdui/icons/emoji-food-beverage.js';
import '@mdui/icons/medication.js';
import '@mdui/icons/search';
import '@mdui/icons/arrow-back.js';
import '@mdui/icons/arrow-forward--outlined.js';
import '@mdui/icons/keyboard-arrow-up.js';
import '@mdui/icons/keyboard-arrow-down.js';
import '@mdui/icons/phone.js';
import '@mdui/icons/email--outlined.js';
import '@mdui/icons/location-on--outlined.js';
import '@mdui/icons/edit--outlined.js';
import '@mdui/icons/check--outlined.js';
import { style as buttonStyle } from "mdui/components/button/style.js";

import "./helpers";

import { setColorScheme } from 'mdui';
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';

import { App } from "./app";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet!);
// this appends a style tag to the head, so I just baked it into the html.
setColorScheme('#a45b89', {
  customColors: []
});
// `mdui-theme-${"light" | "dark" | "auto"}`
document.documentElement.classList.add("mdui-theme-auto");
// disables the "flash of white" styles
document.documentElement.classList.add("loaded");

window.addEventListener("drop", (e) => {
  e.preventDefault();
  console.log("Prevented the default browser behavior of doing stuff with dropped stuff. If you have a use case for this, please open an issue.");
});


(buttonStyle as any).cssText += `
:host([variant=filled]), :host([variant=elevated]) {
  color: rgb(var(--mdui-color-on-primary-container));
  background-color: rgb(var(--mdui-color-primary-container));
}`;

// Source - https://stackoverflow.com/a/52695341
// Posted by Gary Vernon Grubb, modified by community. 
// See post 'Timeline' for change history
// Retrieved 2026-01-30, License - CC BY-SA 4.0

const isInStandaloneMode = () => false
  || (window.matchMedia('(display-mode: standalone)').matches)
  || (window.matchMedia('(display-mode: fullscreen)').matches)
  || (window.matchMedia('(display-mode: minimal-ui)').matches)
  || ("standalone" in window.navigator && window.navigator.standalone)
  || document.referrer.includes('android-app://');

if (isInStandaloneMode()) {
  console.log("webapp is installed")
}


function setup() {
  document.body.appendChild(new App());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup);
} else {
  setup();
}

