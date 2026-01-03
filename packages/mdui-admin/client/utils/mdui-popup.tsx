import { customElement, state } from "lit/decorators.js";
import { JSXElement } from "./JSXElement";

import { addstyles } from "./addstyles";
import mdui_popup_inline_css from "./mdui-popup.inline.css";
import { is, preventDefault, stopPropagation } from "./utils";
import { EventHandler } from "html-jsx";


export interface PopupChild {
  isValid(): boolean;
}

@customElement("mdui-popup")
@addstyles(mdui_popup_inline_css)
export class PopupComp extends JSXElement<{ ok: Event; cancel: Event; }> {

  @state() accessor props!: {
    oncancel: () => void;
    source?: HTMLElement | null;
    cardStyle?: string;
  }

  close(cb?: () => void) {
    this.setAttribute("closing", "true");
    if (cb) setTimeout(cb, 300);
  }
  closepending?: boolean = false;

  private onClickBackground = (e: MouseEvent) => {
    if (e.button > 0) return;
    if (e.type === "pointerdown" && e.target === this) {
      this.closepending = true;
    } else if (e.type === "pointerup" && e.target === this && this.closepending) {
      e.preventDefault();
      e.stopPropagation();
      this.closepending = false;
      this.props.oncancel();
    } else {
      this.closepending = false;
    }
  };
  stopPropagation = (e: Event) => {
    console.log("stopPropagation", e.type, e.target, e.srcElement, e.currentTarget);
    e.stopPropagation();
    this.closepending = false;
  }

  get cardStyle() { return this.props.cardStyle ?? ""; }
  get source() { return this.props.source; }

  protected render(): JSX.Node {
    this.useEventListener(this, "cancel", this.props.oncancel);
    this.useEventListener(this, "popup-layout", (e) => {
      // console.log("popup-layout", e, this.source);
      const detail = card.current;
      if (!is<HTMLDivElement>(detail, detail?.nodeName === "DIV")) return;
      if (!this.source) return;

      const itemRect = this.source.getBoundingClientRect();
      const detailRect = detail.getBoundingClientRect();

      const dx = itemRect.left - detailRect.left - detailRect.width / 2 + itemRect.width / 2;
      const dy = itemRect.top - detailRect.top - detailRect.height / 2 + itemRect.height / 2;
      const sx = itemRect.width / detailRect.width;
      const sy = itemRect.height / detailRect.height;

      this.attributeStyleMap.set("--dx", `${dx}px`);
      this.attributeStyleMap.set("--dy", `${dy}px`);
      this.attributeStyleMap.set("--sx", `${sx}`);
      this.attributeStyleMap.set("--sy", `${sy}`);

    });

    this.useEventListener(this, "pointerdown", this.onClickBackground);
    this.useEventListener(this, "pointerup", this.onClickBackground);
    (["click", "pointerdown", "pointerup", "input", "change", "cancel", "focus", "blur"] as const).forEach(e => {
      this.useEventListener(this.shadowRoot!, e, this.stopPropagation);
    });
    const card = { current: null as any };

    return <div ref={card} class="card" style={`${this.cardStyle};`}><slot></slot></div>;
  }

}


export function openDetail(detail: HTMLElement, item: HTMLElement) {

  const itemRect = item.getBoundingClientRect();
  const detailRect = detail.getBoundingClientRect();

  // Compute deltas
  const dx = itemRect.left - detailRect.left - detailRect.width / 2 + itemRect.width / 2;
  const dy = itemRect.top - detailRect.top - detailRect.height / 2 + itemRect.height / 2;
  const sx = itemRect.width / detailRect.width;
  const sy = itemRect.height / detailRect.height;

  // console.log(dx, itemRect.left, detailRect.left);
  // console.log(dy, itemRect.top, detailRect.top);
  // console.log(sx, itemRect.width, detailRect.width);
  // console.log(sy, itemRect.height, detailRect.height);

  const itemStyle = getComputedStyle(item);
  const detailStyle = getComputedStyle(detail);
  // return;
  // Starting state
  const anim = detail.animate(
    [
      {
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        borderRadius: itemStyle.borderRadius,
        opacity: 0.6,
      },
      {
        // transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        transform: 'none',
        borderRadius: detailStyle.borderRadius,
        opacity: 1,
      }
    ],
    {
      duration: parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--mdui-motion-duration-medium2')), // ~300ms
      easing: getComputedStyle(document.documentElement)
        .getPropertyValue('--mdui-motion-easing-emphasized-decelerate'),
      fill: 'both'
    }
  );

  return anim;

}

declare global {
  interface JSXElementEventMap {
    'popup-layout': Event;
  }
}