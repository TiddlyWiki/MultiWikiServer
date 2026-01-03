import { customElement, state } from "lit/decorators.js";
import { JSXElement } from "./JSXElement";
import { Card } from "mdui";
import { render, updateElement } from "@tiddlywiki/mws-admin/jsx-runtime";
import css from "./virtual-scroller.inline.css";
import { addstyles } from "./addstyles";
import { PropertyValues } from "lit";
import { createHybridRef } from "../../jsx-runtime/jsx-utils";

@addstyles(css)
@customElement("virtual-scroller")
export class VirtualScroller<T> extends JSXElement<{}> {
  @state() accessor props!: {
    renderItem: (index: number) => JSX.Node;
    itemCount: number;
    itemHeight: number;
    positionAt: number | null;
    listVisible: boolean;
  };


  lastStart = 0;
  lastEnd = 100;
  lastIndex = 0;
  lastMiddle = 0;
  lastScrollTop: number | undefined = 0;
  virtualListScrollPosition: number | null = null;
  virtualList: Card | null = null;

  getVirtualListIndexes(scroller?: HTMLElement, curIndex: number | null = null) {
    if (!scroller) return {
      startIndex: 0,
      endIndex: 0,
      middle: 0,
      index: 0,
      scrollTop: 0,
      clientHeight: 0,
    }
    const { scrollTop, clientHeight } = scroller;

    // console.log(scrollTop, clientHeight);

    const index = curIndex ?? Math.floor(scrollTop / 56);
    const count = Math.floor(clientHeight / 56);
    const middle = Math.floor(clientHeight / 56 / 2);

    const startIndex = Math.max(0, index - count);
    const endIndex = Math.max(0, index + count + count);

    return { startIndex, endIndex, middle, index, scrollTop, clientHeight }

  }
  setVirtualList(curIndex: number | null = null) {
    if (!this.props.listVisible || !this.props.itemCount) return;
    const { endIndex, middle, startIndex, index, scrollTop, clientHeight } = this.getVirtualListIndexes(this, curIndex);
    // console.log("setVirtualList", endIndex, middle, startIndex, index, scrollTop)
    if (!this.listStart.current || !this.listEnd.current) return;
    this.listStart.current.style.setProperty("--virtualized-start", `${Math.max(0, startIndex * 56)}px`);
    this.listEnd.current.style.setProperty("--virtualized-end", `${Math.max(0, (this.props.itemCount - endIndex) * 56)}px`);
    render(this, Array.from({ length: Math.min(endIndex, this.props.itemCount) - startIndex }, (_, i) => {
      try {
        return this.props.renderItem(startIndex + i)
      } catch (e) {
        console.log(e);
        return <div style={`height: ${this.props.itemHeight}px; flex: none; color: red;`}>Error rendering item {startIndex + i}</div>
      }
    }));
    // console.log("VirtualScroller rendered items", startIndex, endIndex);
    if (!clientHeight) requestAnimationFrame(() => { this.requestUpdate(); });

    this.lastIndex = index;
    this.lastScrollTop = scrollTop;
    this.lastMiddle = middle;
    this.lastStart = startIndex;
    this.lastEnd = endIndex;

  }

  animFrameScheduled = false;
  scrollHandler = () => {
    if (!this.animFrameScheduled)
      requestAnimationFrame(() => {
        this.animFrameScheduled = false;
        this.setVirtualList();
      });
    this.animFrameScheduled = true;
  };

  listStart = createHybridRef<HTMLDivElement>();
  listEnd = createHybridRef<HTMLDivElement>();

  protected render(): JSX.Node {
    this.useUpdated(() => { this.setVirtualList(); });
    this.useEventListener(this, "scroll", this.scrollHandler);
    // console.log("VirtualScroller render", this.props.listVisible, this.props.positionAt);
    return <>
      <div ref={this.listStart} class="list-start"></div>
      <slot></slot>
      <div ref={this.listEnd} class="list-end"></div>
    </>
  }

}