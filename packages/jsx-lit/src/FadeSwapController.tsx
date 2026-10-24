
import { addstyles, customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import { createHybridRef, HybridRef } from "@tiddlywiki/jsx-runtime";


export class FadeswapController {

  constructor(public context: JSXElement, length: number) {
    this.refs = new Array(length);
    this.preps = new Array(length);
    for (let i = 0; i < length; i++) {
      this.refs[i] = createHybridRef<FadeSwapElement>();
      this.preps[i] = false;
    }
  }

  refs: HybridRef<FadeSwapElement>[];
  preps: boolean[];

  fadePanelOut(index: 0 | 1 | 2, direction: -1 | 0 | 1) {
    return this.refs[index].value?.swapOut(direction) ?? true;
  }
  async fadePanelIn(index: 0 | 1 | 2, direction: -1 | 0 | 1) {
    // Ref assignment happens during synchronous rendering; 
    // await resumes after that render stack completes.
    this.preps[index] = false;
    await this.refs[index].current_;
    this.context.requestUpdate();
    await this.refs[index].value?.swapIn(direction);
  }

  fadePanelSwap = async (
    from: 0 | 1 | 2,
    to: 0 | 1 | 2,
    direction: 0 | 1 | -1,
    swap: () => void
  ) => {
    console.log({ from, to, direction, swap });
    if (from !== to) { this.preps[to] = true; this.context.requestUpdate(); }
    if (!await this.fadePanelOut(from, direction)) return;
    swap();
    await this.fadePanelIn(to, direction);
  }
  /**
   * 
   * this.preps overrides the show code with a display:none element
   * 
   * @param children 
   * @param children `[number][0]` Whether the row should be shown
   * @param children `[number][1]` The render function of the row
   * @returns 
   */
  render(children: [Boolean, () => JSX.Node][]) {
    return children.map(([visible, render], index) => {
      return (visible || this.preps[index]) && <FadeSwapElement
        ref={this.refs[index]}
        webjsx-attr-prepare={this.preps[index]}
      >{render()}</FadeSwapElement>;
    })
  }

}




export class FadeSwap {
  private animation: Animation | null = null;
  private readonly inertStates = new Map<HTMLElement, boolean>();

  constructor() { }

  out(target: HTMLElement, direction: -1 | 0 | 1 = 0): Promise<boolean> {
    return this.animate(target, getComputedStyle(target).opacity, 0, 70, true, direction);
  }

  in(target: Element, direction: -1 | 0 | 1 = 0): Promise<boolean> {
    return this.animate(target, 0, 1, 110, false, direction);
  }

  private async animate(
    target: Element,
    from: string | number,
    to: string | number,
    duration: number,
    hold: boolean,
    direction: -1 | 0 | 1,
  ): Promise<boolean> {
    this.animation?.cancel();
    this.animation = null;
    let animation: Animation | null = null;
    let finished = false;

    try {
      if (target instanceof HTMLElement) {
        if (!this.inertStates.has(target)) this.inertStates.set(target, target.inert);
        target.inert = true;
      }
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const start: Keyframe = { opacity: from };
        const end: Keyframe = { opacity: to };
        if (direction !== 0) {
          start.translate = hold ? "0px" : `${direction * 10}% 0px`;
          end.translate = hold ? `${-direction * 10}% 0px` : "0px";
        }
        animation = target.animate([start, end], {
          duration,
          easing: "ease-out",
          fill: "forwards",
        });
        this.animation = animation;
        await animation.finished;
      }
      finished = true;
      return this.animation === animation;
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
      return false;
    } finally {
      if (this.animation === animation && (!hold || !finished)) {
        animation?.cancel();
        this.animation = null;
        for (const [element, inert] of this.inertStates) element.inert = inert;
        this.inertStates.clear();
      }
    }
  }

}


/** 
 * 
 * Scaffolds fade swap implementation.
 * 
 * this.props only triggers a render when contentStyle changes (using Object.is).
 * 
 * ```jsx
 * <FadeSwapElement contentStyle=""><content/></FadeSwapElement>
 * ```
 */
@addstyles(`
:host {
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  overflow: clip;
  min-width: 0; 
  min-height: 0;
}

slot {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  flex: 1;
}

:host([prepare]) {
  display: none !important;
}

`)
@customElement("fade-swap")
export class FadeSwapElement extends JSXElement {

  @state({
    hasChanged: (nv: FadeSwapElement["props"], ov: FadeSwapElement["props"]) => !Object.is(nv?.contentStyle, ov?.contentStyle)
  }) accessor props!: {
    contentStyle?: JSX.IntrinsicAttributes["style"];
  };

  private readonly fadeSwap = new FadeSwap();
  private readonly content = createHybridRef<HTMLElement>();

  protected render() {
    return <slot part="content" ref={this.content} style={this.props.contentStyle} />;
  }

  swapOut(direction: -1 | 0 | 1 = 0): Promise<boolean> {
    return this.fadeSwap.out(this.content.value!, direction);
  }

  swapIn(direction: -1 | 0 | 1 = 0): Promise<boolean> {
    return this.fadeSwap.in(this.content.value!, direction);
  }
}
