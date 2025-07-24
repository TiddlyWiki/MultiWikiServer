import { css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { breakpoint } from 'mdui';
import { JSXElement } from './JSXElement';
import { Pages, PageElement } from './main';
import { observeResize, unobserveResize } from './resizeObserver';

declare global { interface HTMLElementTagNameMap { 'main-page': MainPage } }
@customElement('main-page')
export class MainPage extends JSXElement<{}> {
  static styles = css`
    :host {
      display:contents;
    }
    mdui-top-app-bar {
      background-color: rgb(var(--mdui-color-surface-container));
      color: rgb(var(--mdui-color-on-surface-container));
    }
    mdui-navigation-rail + mdui-top-app-bar {
      margin-left:5.0625rem;
    }
    mdui-navigation-bar, mdui-navigation-rail {
      background-color: rgb(var(--mdui-color-surface-container));
      color: rgb(var(--mdui-color-on-surface-container));
      border: none;
      box-shadow:none;
    }
    mdui-layout-main {
      position: relative; 
      height:100%;
      display:flex;
      flex-direction:row;
      flex:1;
    }

    my-list {
      flex:1;
    }
  `;


  @state() accessor page: Pages = "list";
  @state() accessor title: string = "";
  @state() accessor showFAB: string = "";

  connectedCallback(): void {
    super.connectedCallback();
    observeResize(document.body, this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    unobserveResize(document.body, this);
  }


  firstUpdated() {
    const page = location.pathname.slice(1);
    const nav = this.navs.find(e => e.value === page);
    if (nav) this.setPage(page as Pages);
    else this.setPage(this.page);

    // const rail = this.shadowRoot!.querySelector('mdui-navigation-rail');
    // rail?.animate(
    //   [
    //     { transform: 'translateX(-100%)', opacity: 0 },
    //     { transform: 'translateX(0)', opacity: 1 }
    //   ],
    //   {
    //     duration: parseInt(
    //       getComputedStyle(this)
    //         .getPropertyValue('--mdui-motion-duration-medium2')
    //     ),                        // → 300 ms
    //     easing: getComputedStyle(this)
    //       .getPropertyValue('--mdui-motion-easing-standard'),
    //     fill: 'both'
    //   }
    // );
  }

  navevent = ({ target }) => {
    this.setPage(target.value);
  };

  setPage(page: Pages) {
    this.page = page;
    this.title = this.navs.find(nav => nav.value === page)?.label || "MWS";
    // history.pushState({}, this.title, "/" + this.page);
  }

  @state() accessor current: PageElement | null = null;

  setCurrent = (e: any) => {
    console.log("set current", e);
    if (e === this.current) return;
    this.current = e;
  };

  navs = [
    { icon: "leaderboard--outlined", value: "list", label: "List" },
    { icon: "image--outlined", value: "images", label: "Images" },
    { icon: "library_music--outlined", value: "library", label: "Library" },
    { icon: "place", value: "item-1", label: "Item 1" },
    { icon: "commute", value: "item-2", label: "Item 2" },
    { icon: "people", value: "item-3", label: "Item 3" },
  ] as const satisfies { icon: string; value: string; label: string; }[];



  render() {
    const bp = breakpoint();
    console.log("render", this.page, this.title, bp);
    const showBar = bp.down("sm");
    const tablet = bp.down("md");

    return <>


      {showBar ? (
        <mdui-navigation-bar
          onchange={this.navevent}
          value={this.page}
          labelVisibility="labeled"
        >
          {this.navs.map(nav => (
            <mdui-navigation-bar-item
              icon={nav.icon}
              value={nav.value}
              active={this.page === nav.value}
            >{nav.label}</mdui-navigation-bar-item>
          ))}
        </mdui-navigation-bar>
      ) : (
        <mdui-navigation-rail
          onchange={this.navevent}
          value={this.page}
        >
          {/* <img style="width:3rem;margin: 0 0.5rem;" src="/mws-logo.png" /> */}
          {this.showFAB ? <mdui-fab
            icon={this.showFAB}
            style={tablet ? `position: fixed; bottom: ${showBar ? "6rem" : "2rem"} ; right: 2rem;` : "margin:1rem 0;"}
          ></mdui-fab> : <div style="height:5.5rem;"></div>}
          {this.navs.map(nav => (
            <mdui-navigation-rail-item
              icon={nav.icon}
              value={nav.value}
              active={this.page === nav.value}
            >{nav.label}</mdui-navigation-rail-item>
          ))}
        </mdui-navigation-rail>
      )}

      <mdui-top-app-bar variant="small" scrolling={window.scrollY > 0}>
        {/* {showBar && <img style="width:3rem;margin: 0 0.5rem;" src="/mws-logo.png" />} */}
        <mdui-top-app-bar-title>{this.current?.pageTitle}</mdui-top-app-bar-title>
      </mdui-top-app-bar>

      <mdui-layout-main>
        {this.page === "list" && <my-list ref={this.setCurrent}></my-list>}
        {/* <div style="height:2000px"></div> */}
      </mdui-layout-main>

    </>;


  }
}
