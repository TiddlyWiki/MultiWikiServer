import 'mdui/mdui.css';
import 'mdui';
// import '@material/web/all.js';

import { setColorScheme } from 'mdui';
setColorScheme('#a45b89');

const themes: "mdui-theme-auto" | "mdui-theme-light" | "mdui-theme-dark" = "mdui-theme-auto";
document.documentElement.classList.add(themes);
document.documentElement.classList.add("loaded");

import "./FormClasses";
import "./my-detail-form";
import "./my-list";
import "./MainPage";
import "./pages/bag-edit";

import { css, PropertyValues, svg } from 'lit';
import { customElement, state } from "lit/decorators.js";
import { JSXElement } from './JSXElement';
import { MyForm } from './my-detail-form';
import { closeDetail, openDetail } from './animate';
import { MainPage } from './MainPage';


export interface SwitchWindowEventDetail {
  from: HTMLElement | "detail";
  to: HTMLElement | "detail";
}

@customElement('my-app')
class App extends JSXElement<{}> {
  static styles = css`
    :host {
      display:contents;
    }
    .detail-ghost {
      display:none;
      position:fixed;
      background: rgb(var(--mdui-color-surface));
      top:0;
      left:0;
      bottom:0;
      right:0;
      opacity:1;
      border:solid black thin;
      z-index:10000;
    }
    .detail-ghost.active {
      display:block;
    }
  `;

  @state() accessor page: string = "home";

  mainref: { current: MainPage | null } = { current: null };
  ghostref: { current: MyForm | null } = { current: null };

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("switchWindow", this.switchWindow)
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("switchWindow", this.switchWindow)
  }

  switchWindow = (event: CustomEvent<SwitchWindowEventDetail>) => {
    const { from, to } = event.detail;
    this.switchDetailView(from, to);
  }

  private switchDetailView(from: "detail" | HTMLElement, to: "detail" | HTMLElement) {
    if (from === "detail" && to !== "detail") {
      const anim = closeDetail(this.ghostref.current!, to);
      anim.onfinish = () => { };
    } else if (to === "detail" && from !== "detail") {
      const anim = openDetail(this.ghostref.current!, from);
      anim.onfinish = () => { this.page = "detail"; };
    } else {
      throw new Error("One must be detail.");
    }
  }

  render() {
    return <>
      {this.page === "home" && <main-page style={this.page === "home" ? "" : "display:none"}></main-page>}
      {this.page === "home" && <div ref={this.ghostref} class="detail-ghost"></div>}
      {this.page === "detail" && <my-form></my-form>}
    </>
  }
}

document.body.appendChild(new App());

export type Pages = MainPage["navs"][number]["value"];

export interface PageElement {
  pageTitle: string;
}


declare global { interface HTMLElementTagNameMap { 'detail-pane': DetailPane; } }
@customElement('detail-pane')
export class DetailPane extends JSXElement<{
  back: CustomEvent<void>;
}> {

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }
  `;

  @state() accessor title: string = "Detail Pane";

  onback = () => {
    this.dispatchEvent(new CustomEvent('back', { bubbles: true }));
  }

  render() {
    return <mdui-layout>
      <mdui-top-app-bar scroll-behavior="elevate" scrolling={window.scrollY > 0} >
        <mdui-button-icon icon="arrow_back" onclick={this.onback}></mdui-button-icon>
        <mdui-top-app-bar-title style="margin-left:1rem;">{this.title}</mdui-top-app-bar-title>
      </mdui-top-app-bar>

      <mdui-layout-main>
        <slot></slot>
      </mdui-layout-main>
    </mdui-layout>;
  }

}



