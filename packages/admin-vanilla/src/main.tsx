/// <reference path="types.d.ts" />
// global css (not scoped)
import "./main.css";
import { App } from "./app";

// disables the "flash of white" styles
document.documentElement.classList.add("loaded");

window.addEventListener("drop", (e) => {
  e.preventDefault();
  console.log("Prevented the default browser behavior of doing stuff with dropped stuff. If you have a use case for this, please open an issue.");
});

declare global {
  const pathPrefix: string;
}

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

