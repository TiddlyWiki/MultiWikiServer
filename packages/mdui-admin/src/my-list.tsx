import { css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { DateTime } from 'luxon';
import { ListItem, breakpoint } from 'mdui';
import { Ref } from 'webjsx';
import { JSXElement } from './JSXElement';
import { PageElement, SwitchWindowEventDetail } from './main';
import { observeResize, unobserveResize } from './resizeObserver';
import { styles } from './my-list.css';


declare global { interface HTMLElementTagNameMap { 'my-list': MyList; } }
@customElement('my-list')
export class MyList extends JSXElement<{}> implements PageElement {

  static styles = styles;


  connectedCallback(): void {
    super.connectedCallback();
    observeResize(document.body, this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    unobserveResize(document.body, this);
  }

  openDetail(day: string, el: ListItem | null) {
    console.log(day, el);
    // this.showDetail = day;
    this.dispatchEvent(new CustomEvent<SwitchWindowEventDetail>("switchWindow", {
      detail: { from: el!, to: "detail", },
      bubbles: true,
      composed: true,
    }));
  }

  @state() accessor showDetail: string = "";

  renderItemWithProgress(date: DateTime<true>, value: number) {
    const max = 35;
    const reffer: Ref<ListItem> = { current: null };
    return <mdui-list-item
      ref={reffer}
      onclick={() => { this.openDetail(date.toISO().slice(0, 10), reffer.current); }}
    >
      <div class="progress" slot="icon">
        <mdui-circular-progress
          value={1} max={1}
          class="progress-background"
          style="stroke: rgb(var(--mdui-color-surface-container-high));"
        ></mdui-circular-progress>
        <mdui-circular-progress
          value={value} max={max}
          class="progress-background"
          style="stroke: rgb(var(--mdui-color-primary));"
        ></mdui-circular-progress>
        {value === max ? (
          <mdui-icon name="check"></mdui-icon>
        ) : (
          <div class="progress-number">{value}</div>
        )}
      </div>

      <span>{date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}</span>
      <span slot="end-icon">{date.hasSame(DateTime.now(), "day") ? "today" : ""}</span>
    </mdui-list-item>;
  }

  pageTitle = "Tracking stats";

  render() {
    const bp = breakpoint();
    const mobile = bp.down("sm");
    const tablet = bp.down("md");
    const desktop = bp.down("lg");
    const bpclass = mobile ? "bp-mobile" : tablet ? "bp-tablet" : desktop ? "bp-desktop" : "bp-wide";
    function* dater() {
      let start = DateTime.now();
      while (true) {
        yield start;
        start = start.minus({ days: 1 });
      }
      return start; //typing
    }
    const d1 = dater();
    let d2;
 
    return (
      <div class={`page ${bpclass}`}>
        <mdui-card variant='filled' class={tablet ? "page-list" : "page-list fixed"}>
          <mdui-list class={tablet ? "list-column" : "list-column fixed"}>
            <mdui-list-item>{bpclass}</mdui-list-item>
            {this.renderItemWithProgress((d1.next().value), 25)}
            {this.renderItemWithProgress((d1.next().value), 15)}
            {this.renderItemWithProgress((d1.next().value), 30)}
            {this.renderItemWithProgress((d1.next().value), 10)}
            {this.renderItemWithProgress((d1.next().value), 20)}
            {this.renderItemWithProgress((d1.next().value), 35)}
          </mdui-list>
        </mdui-card>
      </div>
    );
  }
}
