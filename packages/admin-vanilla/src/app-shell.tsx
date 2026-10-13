import { addstyles, customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import closeIcon from "@material-symbols/svg-400/outlined/close.svg";
import errorIcon from "@material-symbols/svg-400/outlined/error.svg";
import warningIcon from "@material-symbols/svg-400/outlined/warning.svg";
import infoIcon from "@material-symbols/svg-400/outlined/info.svg";
import successIcon from "@material-symbols/svg-400/outlined/check_circle.svg";
import accountCircleIcon from "@material-symbols/svg-400/outlined/account_circle.svg";
import { MaterialSymbol } from "./material-symbol";
import { tw5logo } from "./logos";
import { logout } from "./passwords";

export type RenderContent = () => JSX.Node;

export interface EditPageModel {
  title: string;
  eyebrow: string;
  description?: string;
  mode: "create" | "edit";
  loading?: boolean;
  saving?: boolean;
  error?: string;
  saveLabel?: string;
  renderCurrent?: RenderContent;
  renderEditor?: RenderContent;
  renderPreview?: RenderContent;
  onClose: () => void;
  onSave?: () => void | Promise<void>;
  onDismissError?: () => void;
}

interface SectionProps {
  title?: string;
  description?: string | string[];
  renderContent: RenderContent;
}

@customElement("mws-page-section")
export class PageSection extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: SectionProps;

  protected render() {
    const { title, description, renderContent } = this.props;
    return <section class="modal-section">
      {title || description ? <header class="modal-section-header">
        {title ? <div><h4>{title}</h4></div> : null}
        {description
          ? Array.isArray(description)
            ? description.map(e => <p>{e}</p>)
            : <p>{description}</p>
          : null}
      </header> : null}
      <div class="section-field-grid">{renderContent()}</div>
    </section>;
  }
}

interface CardProps extends SectionProps {
  width?: "half" | "full";
  layout?: "single" | "stack" | "grid";
  renderHeaderAction?: RenderContent;
  footerDescription?: string;
}

@customElement("mws-page-card")
export class PageCard extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: CardProps;

  constructor() {
    super();
    this.style.display = "contents";
  }

  protected render() {
    const { title, description, width, layout, renderContent, renderHeaderAction, footerDescription } = this.props;
    return <article class={width === "full" ? "field-card is-full" : "field-card"}>
      {title || description || renderHeaderAction ? <header class="field-card-header">
        <div class="field-card-header-row">
          {title ? <h4>{title}</h4> : null}
          {renderHeaderAction?.()}
        </div>
        {description
          ? Array.isArray(description)
            ? description.map(e => <p>{e}</p>)
            : <p>{description}</p>
          : null}
      </header> : null}
      <div class={layout === "stack" ? "composite-fields is-stack" : layout === "grid" ? "composite-fields" : "single-field"}>
        {renderContent()}
      </div>
      {footerDescription ? <div class="field-card-footer-note"><p>{footerDescription}</p></div> : null}
    </article>;
  }
}

@customElement("mws-current-section")
export class CurrentSection extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: SectionProps;

  protected render() {
    const { title, renderContent } = this.props;
    return <div class="sidebar-section">
      {title ? <h4 class="sidebar-section-title">{title}</h4> : null}
      <div class="sidebar-section-body">{renderContent()}</div>
    </div>;
  }
}

interface EditorFieldProps extends SectionProps {
  inputId?: string;
}

@customElement("mws-editor-field")
export class EditorField extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: EditorFieldProps;

  constructor() {
    super();
    this.style.display = "contents";
  }

  protected render() {
    const { title, description, inputId, renderContent } = this.props;
    return <div class="field-block">
      <div class="field-editor">
        {title ? <label class="field-label" for={inputId}>{title}</label> : null}
        {description
          ? Array.isArray(description)
            ? description.map(e => <p class="field-helper">{e}</p>)
            : <p class="field-helper">{description}</p>
          : null}
        {renderContent()}
      </div>
    </div>;
  }
}

interface ModalViewProps {
  open: boolean;
  onClose: () => void;
  onAfterClose: () => void;
  children?: JSX.Node;
}

@customElement("mws-modal-view")
@addstyles(`
  :host {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    padding: 28px;
    box-sizing: border-box;
  }
  :host([hidden]) { display: none; }
  .backdrop {
    position: absolute;
    inset: 0;
    background: var(--color-overlay-modal);
    backdrop-filter: blur(10px);
  }
  .panel {
    position: relative;
    width: 100%;
    min-height: 0;
    max-height: calc(100dvh - 56px);
    display: flex;
    flex-direction: column;
    transform-origin: top center;
  }
  slot { display: contents; }
  ::slotted(*) { max-height: inherit; }
  @media (max-width: 900px) {
    :host { padding: 14px; }
    .panel { max-height: calc(100dvh - 28px); }
  }
`)
export class ModalView extends JSXElement {
  @state() accessor props!: ModalViewProps;
  private wasOpen = false;
  private animations: Animation[] = [];

  constructor() {
    super();
    this.hidden = true;
  }

  private readonly updateAnimation = () => {
    const { open } = this.props;
    if (open === this.wasOpen) return;
    this.wasOpen = open;
    const backdrop = this.shadowRoot!.querySelector<HTMLElement>(".backdrop")!;
    const panel = this.shadowRoot!.querySelector<HTMLElement>(".panel")!;
    const interrupted = this.animations.length > 0;
    const backdropOpacity = interrupted ? getComputedStyle(backdrop).opacity : open ? "0" : "1";
    const panelOpacity = interrupted ? getComputedStyle(panel).opacity : open ? "0" : "1";
    const panelTransform = interrupted ? getComputedStyle(panel).transform
      : open ? "translateY(16px) scale(0.985)" : "none";
    this.animations.forEach((animation) => animation.cancel());
    this.animations = [];
    this.hidden = false;
    this.toggleAttribute("open", true);
    this.inert = !open;

    const finish = () => {
      if (this.props.open !== open) return;
      this.animations.forEach((animation) => animation.cancel());
      this.animations = [];
      if (!open) {
        this.hidden = true;
        this.removeAttribute("open");
        this.props.onAfterClose();
      }
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    const options: KeyframeAnimationOptions = {
      duration: open ? 220 : 160,
      easing: open ? "cubic-bezier(0.2, 0.8, 0.2, 1)" : "ease-in",
      fill: "both",
    };
    this.animations = [
      backdrop.animate([{ opacity: backdropOpacity }, { opacity: open ? 1 : 0 }], options),
      panel.animate([
        { opacity: panelOpacity, transform: panelTransform },
        { opacity: open ? 1 : 0, transform: open ? "none" : "translateY(10px) scale(0.99)" },
      ], options),
    ];
    void Promise.all(this.animations.map((animation) => animation.finished)).then(finish, () => {});
  };

  disconnectedCallback() {
    this.animations.forEach((animation) => animation.cancel());
    this.animations = [];
    this.wasOpen = false;
    this.hidden = true;
    this.removeAttribute("open");
    super.disconnectedCallback();
  }

  protected render() {
    this.useUpdated(this.updateAnimation);
    return <>
      <div class="backdrop" onclick={() => {
        if (this.props.open) this.props.onClose();
      }} />
      <div class="panel"><slot /></div>
    </>;
  }
}

@customElement("mws-edit-page")
export class EditPage extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: { model: EditPageModel | null };
  private retainedModel: EditPageModel | null = null;

  private readonly afterClose = () => {
    if (this.props.model) return;
    this.retainedModel = null;
    this.requestUpdate();
  };

  protected render() {
    if (this.props.model) this.retainedModel = this.props.model;
    const model = this.retainedModel;
    return <ModalView
      open={!!this.props.model}
      onClose={() => { if (model && !model.saving) model.onClose(); }}
      onAfterClose={this.afterClose}
    >
      {model ? <section class="modal-card" role="dialog" aria-modal="true" aria-label={model.title} aria-busy={model.loading || model.saving ? "true" : "false"}>
        <header class="modal-header">
          <div class="modal-title">
            <p class="eyebrow">{model.eyebrow}</p>
            <h3>{model.loading ? "Loading..." : model.title}</h3>
            {model.description ? <p>{model.description}</p> : null}
          </div>
          <button class="close-button" type="button" onclick={model.onClose} disabled={model.saving} aria-label="Close details">
            <MaterialSymbol icon={closeIcon} />
          </button>
        </header>
        {model.loading ? <div class="modal-loading-shell">
          <div class="modal-loading-bar" aria-hidden="true"><span></span></div>
          <p class="modal-loading-copy" role="status">Loading details...</p>
        </div> : <div class="modal-layout">
          {model.renderCurrent ? <aside class="field-index modal-sidebar">{model.renderCurrent()}</aside> : null}
          <div class="field-stack modal-main">
            {model.renderEditor?.()}
            {model.renderPreview?.()}
            <footer class="modal-actions">
              <button class="ghost-button" type="button" onclick={model.onClose} disabled={model.saving}>{model.onSave ? "Cancel" : "Close"}</button>
              {model.onSave ? <button class="primary-button" type="button" onclick={model.onSave} disabled={model.saving}>
                {model.saving ? "Saving..." : model.saveLabel ?? (model.mode === "create" ? "Create" : "Save changes")}
              </button> : null}
            </footer>
          </div>
        </div>}
        {model.error ? <footer class="modal-header" role="alert" aria-live="polite">
          <pre style="white-space: break-spaces;">{model.error}</pre>
          {model.onDismissError ? <button class="error-close-button" type="button" onclick={model.onDismissError} aria-label="Dismiss error message">
            <MaterialSymbol icon={closeIcon} />
          </button> : null}
        </footer> : null}
      </section> : null}
    </ModalView>;
  }
}

interface ListPageProps {
  pageId: string;
  title: string;
  eyebrow?: string;
  description?: string;
  ariaLabel: string;
  renderActions: RenderContent;
  renderContent: RenderContent;
}

@customElement("mws-list-page")
export class ListPage extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: ListPageProps;
  private displayedProps: ListPageProps | null = null;
  private transition: Animation | null = null;
  private swapping = false;

  private readonly updateAnimation = () => {
    if (this.swapping || this.props.pageId === this.displayedProps?.pageId) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.displayedProps = this.props;
      this.requestUpdate();
      return;
    }
    const section = this.querySelector<HTMLElement>(".app-list-page")!;
    const opacity = getComputedStyle(section).opacity;
    this.transition?.cancel();
    this.swapping = true;
    section.inert = true;
    const leave = section.animate([{ opacity }, { opacity: 0 }], {
      duration: 70, easing: "ease-out", fill: "forwards",
    });
    this.transition = leave;
    void leave.finished.then(async () => {
      if (!this.isConnected || this.transition !== leave) return;
      this.displayedProps = this.props;
      this.requestUpdate();
      await this.updateComplete;
      if (!this.isConnected || this.transition !== leave) return;
      leave.cancel();
      section.inert = false;
      const enter = section.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 110, easing: "ease-out", fill: "forwards",
      });
      this.transition = enter;
      this.swapping = false;
      this.requestUpdate();
      void enter.finished.then(() => {
        if (this.transition !== enter) return;
        enter.cancel();
        this.transition = null;
      }, () => {});
    }, () => {});
  };

  disconnectedCallback() {
    this.transition?.cancel();
    this.transition = null;
    this.swapping = false;
    this.querySelector<HTMLElement>(".app-list-page")?.removeAttribute("inert");
    super.disconnectedCallback();
  }

  protected render() {
    this.useUpdated(this.updateAnimation);
    if (!this.displayedProps || this.props.pageId === this.displayedProps.pageId) {
      this.displayedProps = this.props;
    }
    const { title, eyebrow, description, ariaLabel, renderActions, renderContent } = this.displayedProps;
    return <section class="app-list-page">
      <header class="app-page-heading">
        <div class="app-page-title">
          {eyebrow ? <p class="eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
          {description ? <p class="section-copy">{description}</p> : null}
        </div>
        <div class="app-page-actions">{renderActions?.()}</div>
      </header>
      <div class="app-page-content">
        <div class="rich-list" role="list" aria-label={ariaLabel}>
          {renderContent?.()}
        </div>
      </div>
    </section>;
  }
}

interface RichListItemProps {
  placeholder?: boolean;
  renderMain?: RenderContent;
  renderMeta?: RenderContent;
  renderActions?: RenderContent;
}

@customElement("mws-rich-list-item")
export class RichListItem extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: RichListItemProps;

  protected render() {
    const { placeholder, renderMain, renderMeta, renderActions } = this.props;

    return <article class="rich-list-item" role="listitem" aria-hidden={placeholder ? "true" : undefined}>
      <div class="rich-list-main">{placeholder ? <>
        <span class="rich-list-placeholder is-title" />
        <span class="rich-list-placeholder is-description" />
        <span class="rich-list-placeholder is-detail" />
      </> : renderMain?.()}</div>
      <div class="rich-list-metadata">{placeholder ? <>
        <span class="rich-list-placeholder is-meta" />
        <span class="rich-list-placeholder is-detail" />
      </> : renderMeta?.()}</div>
      {!placeholder && renderActions ? <div class="rich-list-actions">{renderActions()}</div> : null}
    </article>;

  }
}

interface FeedbackNoticeProps {
  title: string;
  tone?: "info" | "success" | "warning" | "error";
  renderContent?: RenderContent;
  onDismiss?: () => void;
}

@customElement("mws-feedback-notice")
export class FeedbackNotice extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: FeedbackNoticeProps;

  protected render() {
    const { title, tone = "info", renderContent, onDismiss } = this.props;
    const icon = {
      info: infoIcon,
      success: successIcon,
      warning: warningIcon,
      error: errorIcon,
    }[tone];

    return <section
      class={`app-feedback-notice is-${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <span class="app-feedback-icon" aria-hidden="true">
        <MaterialSymbol icon={icon} />
      </span>
      <div class="app-feedback-message">
        <h2>{title}</h2>
        {renderContent ? <div class="app-feedback-body">
          {renderContent()}
        </div> : null}
      </div>
      {onDismiss ? <button
        class="app-feedback-dismiss"
        type="button"
        aria-label="Dismiss notification"
        title="Dismiss notification"
        onclick={onDismiss}
      >
        <MaterialSymbol icon={closeIcon} />
      </button> : null}
    </section>;
  }
}

interface AppShellProps {
  renderNavigation?: RenderContent;
  renderContent?: RenderContent;
  renderFeedback?: RenderContent;
}

@customElement("mws-app-shell")
export class AppShell extends JSXElement {
  useLightDOM = true;
  @state() accessor props: AppShellProps = {};

  private readonly closeAccountMenus = (event: MouseEvent) => {
    for (const menu of this.querySelectorAll<HTMLDetailsElement>(".hero-account-menu")) {
      if (event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this.closeAccountMenus, true);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.closeAccountMenus, true);
    super.disconnectedCallback();
  }

  protected render() {
    const versions = embeddedServerResponse.tw5Versions;
    const user = embeddedServerResponse.userState;
    const feedback = this.props.renderFeedback?.();
    return <div class="admin-shell app-shell-layout">
      <header class="hero-panel">
        <div class="hero-panel-content">
          <p class="eyebrow">Multi-wiki server administration</p>
          <h1 style="display:flex; gap: 1rem; align-items:center;"><span>MWS</span></h1>
          <p class="hero-copy">All your thoughts, in as many places as you need them.</p>
        </div>
        <div class="hero-account-shell">
          <details class="hero-account-menu">
            <summary class="hero-account-trigger" aria-label="TiddlyWiki versions">
              <span class="hero-account-name">{versions.slice(-1)[0]}</span>
              <span class="hero-account-icon" aria-hidden="true"><MaterialSymbol icon={tw5logo} /></span>
            </summary>
            <div class="hero-account-dropdown" role="menu" aria-label="TiddlyWiki versions">
              {versions.map((version) => <a class="hero-account-action" role="menuitem" href={pathPrefix + embeddedServerResponse.rootRoutes.tw5 + "/" + version}>{version}</a>)}
            </div>
          </details>
          <details class="hero-account-menu">
            <summary class="hero-account-trigger" aria-label="Open account menu">
              <span class="hero-account-name">{user.username}</span>
              <span class="hero-account-icon" aria-hidden="true">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <MaterialSymbol icon={accountCircleIcon} />}</span>
            </summary>
            <div class="hero-account-dropdown" role="menu" aria-label="Account options">
              <a class="hero-account-action" role="menuitem" href={pathPrefix + "/profile"}>Profile</a>
              <button class="hero-account-action" type="button" role="menuitem" onclick={logout}>Logout</button>
            </div>
          </details>
        </div>
      </header>
      {feedback ? <div class="app-feedback-region">{feedback}</div> : null}
      <div class="app-workspace">
        <nav class="app-navbar" aria-label="Admin sections">
          {this.props.renderNavigation?.()}
        </nav>
        <main class="app-main">
          {this.props.renderContent?.()}
        </main>
      </div>
    </div>;
  }
}