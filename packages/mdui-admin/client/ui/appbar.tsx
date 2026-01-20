import { customElement, state } from "lit/decorators.js";
import { addstyles } from "../utils/addstyles";
import { JSXElement } from "../utils/JSXElement";
import appbar_inline_css from "./appbar.inline.css";
import { createHybridRef } from "../../jsx-runtime/jsx-utils";
import { Card } from "mdui";
import "@mdui/icons/arrow-back";
import '@mdui/icons/menu.js';


@customElement('mws-appbar')
@addstyles(appbar_inline_css)
export class SearchBar extends JSXElement<{
  search: CustomEvent<string>;
}> {
  @state() accessor props!: {
    title: string;
    onsearch: (search: string) => void;
    disabled?: boolean;
  };

  appbarRef = createHybridRef<Card>();

  @state() accessor searching: boolean = false;

  render() {
    const ANIM_SPEED = 150;
    return <>
      <mdui-card
        disabled={!!this.props.disabled}
        ref={this.appbarRef} class="appbar" clickable
        onclick={() => {
          if(this.props.disabled) return;
          this.appbarRef.current?.setAttribute("search", "");
          setTimeout(() => { this.searching = true; }, ANIM_SPEED);
        }}
        style={`--anim-speed: ${ANIM_SPEED}ms;`}
      >
        {!this.searching ? (
          <mdui-button-icon
            disabled={!!this.props.disabled}
            class="appbar-left"
            onclick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              if (this.props.disabled) return;
            }}
            style="width: 56px; height: 56px;"
          >
            <mdui-icon-menu></mdui-icon-menu>
            {/* <img
              style="width: 30px; height: 30px;"
              src={pathPrefix + "/favicon.png"}
            /> */}
          </mdui-button-icon>
        ) : (
          <mdui-button-icon
            disabled={!!this.props.disabled}
            class="appbar-back"
            onclick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (this.props.disabled) return;
              const el = e.currentTarget;
              el.setAttribute("back", "");
              setTimeout(() => {
                el.removeAttribute("back");
                this.searching = false;
                this.appbarRef.current?.removeAttribute("search");
              }, ANIM_SPEED);
            }}
            style="width: 56px; height: 56px;"
          >
            <mdui-icon-arrow-back></mdui-icon-arrow-back>
          </mdui-button-icon>
        )}


        {!this.searching ? (
          <span>{this.props.title}</span>
        ) : (
          <input
            disabled={!!this.props.disabled}
            type="text"
            placeholder={this.props.title}
            class="appbar-search-input"
            onkeydown={(e) => {
              if (e.key === "Escape") {
                const el = (e.currentTarget as HTMLElement).parentElement?.querySelector(".appbar-back");
                if (el) { (el as HTMLElement).click(); }
              }
            }}
            ref={(e) => { setTimeout(() => e?.focus(), 0); }}
          ></input>
        )}
        {!this.searching ? (
          <mdui-button-icon
            class="appbar-right"
            onclick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style="width: 56px; height: 56px;"
          >
            <img
              style="width: 30px; height: 30px; border-radius:30px;"
              src="https://avatars.githubusercontent.com/u/3030330?s=30&v=4"
            ></img>
          </mdui-button-icon>
        ) : null}
      </mdui-card>

    </>
  }
}
