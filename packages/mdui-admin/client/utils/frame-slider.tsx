import { customElement, property } from "lit/decorators.js";
import { addstyles } from "./addstyles";
import { JSXElement } from "./JSXElement";
import { HTMLAttributes } from "html-jsx";
import frame_slider_inline_css from "./frame-slider.inline.css";
import { render } from "@tiddlywiki/mws-admin/jsx-runtime";
import { observed, ReactiveAttributeObserver, ReactiveHTMLElement } from "./ReactiveHTMLElement";
import { Subject } from "rxjs";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "frame-slider": {
        /** index of the left hand frame */
        "frame-index"?: string | number;
        /** visible number of frames */
        "frame-count"?: string | number;
        /** Total number of frames  */
        "frame-length"?: string | number;
        slot?: string;
        "onframe-sliding"?: (e: CustomEvent<{
          index: number;
          count: number;
          length: number;
          left: boolean | undefined;
          right: boolean | undefined;
        }>) => void;
      } & JSX.IntrinsicAttributes
      "frame-slider-wrap": FrameSliderWrapElement
      "frame-slider-item": FrameSliderItemElement
    }
  }
}
interface FrameSliderWrapElement extends JSX.HTMLAttributes<HTMLElement> {
  left?: boolean;
  right?: boolean;
  extend?: boolean;
  extending?: boolean;
  slide?: boolean;
  sliding?: boolean;
  instant?: boolean;
}
interface FrameSliderItemElement extends JSX.HTMLAttributes<HTMLElement> {
  prepare?: boolean;
  empty?: boolean;
}
function scheduleRender(this: FrameSlider) {
  this.scheduleUpdate();
}
declare global { interface HTMLElementTagNameMap { 'frame-slider': FrameSlider; } }
@customElement('frame-slider')
export class FrameSlider extends ReactiveHTMLElement {
  static ElementStyles = this.getElementStyles(frame_slider_inline_css);

  @observed<FrameSlider>("frame-index", function (oldv, newv) {
    // console.log("frame-index", oldv, newv)
    if (oldv === newv) return;
    if (oldv === null) this.index = newv ? +newv : 0;
    this.scheduleUpdateFrames();
  }) accessor frameIndex: string = "";

  @observed<FrameSlider>("frame-count", function (oldv, newv) {
    // console.log("frame-count", oldv, newv)
    if (oldv === newv) return;
    if (oldv === null) this.count = newv ? +newv : 0;
    this.scheduleUpdateFrames();
  }) accessor frameCount: string = "";

  @observed<FrameSlider>("frame-length", function (oldv, newv) {
    // console.log("frame-length", oldv, newv)
    if (oldv === newv) return;
    if (oldv === null) this.length = newv ? +newv : 0;
    this.scheduleUpdateFrames();
  }) accessor frameLength: string = "";

  connectedCallback() {
    this.update();
  }

  updateScheduled: boolean = false;
  scheduleUpdate(cb?: () => void) {
    if (this.updateScheduled) return;
    requestAnimationFrame(() => {
      this.updateScheduled = false;
      this.update();
      cb?.();
    });
    this.updateScheduled = true;
  }
  updateFramesScheduled: boolean = false;
  scheduleUpdateFrames(cb?: () => void) {
    if (this.updateFramesScheduled) return;
    requestAnimationFrame(() => {
      this.updateFramesScheduled = false;
      this.updateFrames();
      cb?.();
    });
    this.updateFramesScheduled = true;
  }

  updateFrames() {
    const count = +this.frameCount;
    const index = +this.frameIndex;
    const length = +this.frameLength;
    // console.log("frames", { index, count, length }, (({ index, count, length }) => ({ index, count, length }))(this));
    if (count !== this.count
      || index !== this.index
      || length !== this.length
    ) {
      if (index !== this.index) {
        this.slide = true;
        this.left = index > this.index;
        this.right = index < this.index;
        if (this.left) {
          this.frameLeft = new Set([this.index]);
          this.frameMiddle = new Set(new Array(Math.max(0, this.count - 1)).fill(0).map((_, i) => 1 + i + this.index));
          this.frameRight = new Set([this.index + this.count]);
          // console.log(this.frameLeft, this.frameMiddle, this.frameRight);
        } else if (this.right) {
          this.frameLeft = new Set([index]);
          this.frameMiddle = new Set(new Array(Math.max(0, count - 1)).fill(0).map((_, i) => 1 + i + index));
          this.frameRight = new Set([index + count]);
          // console.log(this.frameLeft, this.frameMiddle, this.frameRight);
        }

      } else if (length <= count && length !== this.length) {
        this.extend = true;
        this.left = length > this.length;
        this.right = length < this.length;
        this.frameRight = new Set([this.length]);

      }
      this.count = count;
      this.index = index;
      this.length = length;
      this.instant = false;
      this.scheduleUpdate(() => this.scheduleUpdateFrames());
    } else if (this.slide || this.extend) {
      this.sliding = this.slide;
      this.extending = this.extend;
      this.slide = false;
      this.extend = false;
      // console.log("prepared");
      this.scheduleUpdate(() => { setTimeout(() => { this.scheduleUpdateFrames() }, 500) });
    } else {
      // debugger;
      this.instant = true;
      this.sliding = false;
      this.extending = false;
      this.left = false;
      this.right = false;
      this.frameLeft = new Set();
      this.frameMiddle = new Set(new Array(Math.min(length, count)).fill(0).map((_, i) => i + this.index));
      this.frameRight = new Set();
      this.scheduleUpdate();
    }
  }

  update() {
    render(this.shadowRoot!, this.render());
    // console.log("render", this.frameLeft, this.frameMiddle, this.frameRight);
    if (this.extending || this.sliding) {
      // console.log(this.frameLeft, this.frameMiddle, this.frameRight);
      this.dispatchEvent(new CustomEvent("frame-sliding", {
        detail: { index: this.index, count: this.count, length: this.length, left: this.left, right: this.right }
      }));
    }
    // if (this.prepare || this.extend || this.sliding) debugger;
  }

  left?: boolean;
  right?: boolean;
  slide?: boolean;
  extending?: boolean;
  sliding?: boolean;
  instant?: boolean;

  count: number = 0;
  index: number = 0;
  length: number = 0;

  frameLeft = new Set();
  frameMiddle = new Set();
  frameRight = new Set();

  extend = false;

  render() {
    // console.log("render", (() => {
    //   const count = +this.frameCount;
    //   const index = +this.frameIndex;
    //   const length = +this.frameLength;
    //   return { index, count, length };
    // })(), (({ index, count, length }) => ({ index, count, length }))(this));

    return (
      <frame-slider-wrap
        left={this.left}
        right={this.right}
        slide={this.slide}
        extend={this.extend}
        extending={this.extending}
        sliding={this.sliding}
        instant={this.instant}
        style={`--frame-width: ${100 / +this.frameCount}%; --frame-speed: 0.5s; --frame-count: ${this.count + 1}`}
      >
        {new Array(this.length + 1).fill(0).map((_, i) => {
          const left = this.frameLeft.has(i);
          const middle = this.frameMiddle.has(i);
          const right = this.frameRight.has(i);
          if (left || middle || right)
            return <frame-slider-item
              frame-left={left}
              frame-middle={middle}
              frame-right={right}
            >
              <slot name={`frame-${i}`}></slot>
            </frame-slider-item>
          else
            return null;
        })}
      </frame-slider-wrap>
    );
  }

}
