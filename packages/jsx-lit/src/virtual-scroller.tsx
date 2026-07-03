import { render, createHybridRef } from "@tiddlywiki/jsx-runtime";
import { addstylesinner, JSXElement } from "@tiddlywiki/jsx-lit";
import { Card } from "mdui";

export class VirtualScroller extends JSXElement {
  private static registered = false;
  private static register() {
    addstylesinner(/*css*/`
:host {
  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-color: rgb(var(--mdui-color-primary)) transparent;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  overflow-anchor: none;
}

.list-start {
  flex: 0 0 var(--virtualized-start);
}

.list-end {
  flex: 0 0 var(--virtualized-end);
}  
`, this);
    customElements.define("virtual-scroller", this);

  }

  constructor() {
    // lazy register to allow tree shaking
    // this only works because VirtualScroller is used by reference.
    VirtualScroller.register();
    super();
  }

  get "webjsx-donotdescend"() { return true; }

  #props!: {
    renderItem: (index: number) => JSX.Node;
    itemCount: number;
    itemHeight: number;
    positionAt: number | null;
    listVisible: boolean;
  };

  get props() { return this.#props; }
  set props(v) { this.#props = v; this.requestUpdate(); }

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

    const distance = this.props.itemHeight;

    const index = curIndex ?? Math.floor(scrollTop / distance);
    const count = Math.floor(clientHeight / distance);
    const middle = Math.floor(clientHeight / distance / 2);

    const startIndex = Math.max(0, index - count);
    const endIndex = Math.max(0, index + count + count);

    return { startIndex, endIndex, middle, index, scrollTop, clientHeight }

  }
  setVirtualList(curIndex: number | null = null) {
    if (!this.props.listVisible) return;
    if (!this.props.itemCount) {
      render(this, []);
      this.listStart.current?.style.setProperty("--virtualized-start", "");
      this.listEnd.current?.style.setProperty("--virtualized-end", "");
      return;
    }
    const { endIndex, middle, startIndex, index, scrollTop, clientHeight } = this.getVirtualListIndexes(this, curIndex);
    const distance = this.props.itemHeight;

    if (!this.listStart.current || !this.listEnd.current) return;
    this.listStart.current.style.setProperty("--virtualized-start", `${Math.max(0, startIndex * distance)}px`);
    this.listEnd.current.style.setProperty("--virtualized-end", `${Math.max(0, (this.props.itemCount - endIndex) * distance)}px`);
    render(this, Array.from({ length: Math.min(endIndex, this.props.itemCount) - startIndex }, (_, i) => {
      try {
        return this.props.renderItem(startIndex + i)
      } catch (e) {
        console.log(e);
        return <div style={`height: ${this.props.itemHeight}px; flex: none; color: red;`}>Error rendering item {startIndex + i}</div>
      }
    }));

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

  listStart = createHybridRef<HTMLElement>();
  listEnd = createHybridRef<HTMLElement>();

  protected render(): JSX.Node {
    this.useUpdated(() => { this.setVirtualList(); });
    this.useEventListener(this)("scroll", this.scrollHandler);
    // console.log("VirtualScroller render", this.props.listVisible, this.props.positionAt);
    return <>
      <div ref={this.listStart} class="list-start"></div>
      <slot></slot>
      <div ref={this.listEnd} class="list-end"></div>
    </>
  }

}