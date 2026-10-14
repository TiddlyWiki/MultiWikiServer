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
import { SendError } from "@/server";

export type RenderContent = () => JSX.Node;

export interface EditPageModel {
  title: string;
  eyebrow: string;
  description?: string;
  mode: "create" | "edit";
  loading?: boolean;
  saving?: boolean;
  error?: Error;
  saveLabel?: string;
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
    void Promise.all(this.animations.map((animation) => animation.finished)).then(finish, () => { });
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
@addstyles(`
  :host { display: contents; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  slot { display: contents; }
  .modal-card {
    width: 100%;
    max-height: calc(100dvh - 56px);
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border-soft);
    border-radius: 28px;
    box-shadow: 0 18px 40px var(--color-shadow-card);
    overflow: hidden;
    background: var(--color-surface-modal);
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 24px 26px;
    flex: 0 0 116px;
    min-height: 116px;
    border-bottom: 1px solid var(--color-border-soft);
    background: linear-gradient(180deg, var(--color-surface-modal-header-top) 0%, var(--color-surface-modal-header-bottom) 100%);
  }
  footer.modal-header {
    border-top: 1px solid var(--color-border-soft);
    border-bottom: 0;
  }
  footer.modal-header mws-feedback-notice { width: 100%; }
  .modal-header h3 {
    margin: 0 0 8px;
    font-family: Georgia, "Times New Roman", serif;
    font-weight: 600;
    font-size: 2rem;
    color: var(--color-text-heading);
  }
  .modal-header p { margin: 0; color: var(--color-text-muted); }
  .modal-header .eyebrow {
    margin: 0 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 0.72rem;
    color: var(--color-accent-eyebrow);
  }
  .modal-title { flex: 1; min-width: 0; overflow-wrap: anywhere; }
  button { font: inherit; cursor: pointer; }
  .close-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 50%;
    background: var(--color-surface-ghost-button);
    color: var(--color-accent-button-text);
    padding: 0;
  }
  .close-button material-symbol,
  .close-button svg { display: block; width: 20px; height: 20px; }
  material-symbol svg { fill: currentColor; }
  .modal-layout {
    display: flex;
    align-items: flex-start;
    gap: 22px;
    padding: 24px;
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
  }
  .modal-loading-shell {
    display: grid;
    gap: 18px;
    padding: 32px 26px 36px;
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    align-content: start;
  }
  .modal-loading-bar {
    position: relative;
    height: 12px;
    border-radius: 999px;
    overflow: hidden;
    background: var(--color-fill-loading-bar);
    border: 1px solid var(--color-border-accent-soft);
  }
  .modal-loading-bar span {
    display: block;
    width: 38%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--color-accent-track-soft) 0%, var(--color-accent-track-mid) 48%, var(--color-accent-track) 100%);
    transform: translate3d(-120%, 0, 0);
    animation: modal-loading-slide 1.2s ease-in-out infinite;
    will-change: transform;
  }
  .modal-loading-copy { margin: 0; color: var(--color-text-soft); line-height: 1.6; }
  @keyframes modal-loading-slide {
    0% { transform: translate3d(-120%, 0, 0); }
    100% { transform: translate3d(280%, 0, 0); }
  }
  .modal-sidebar {
    flex: 0 0 260px;
    width: 260px;
    max-width: 100%;
    position: sticky;
    top: 0;
    align-self: start;
    display: grid;
    gap: 16px;
    padding: 20px;
    border: 1px solid var(--color-border-soft);
    border-radius: 20px;
    box-shadow: 0 18px 40px var(--color-shadow-card);
    background: var(--color-surface-sidebar);
    overflow: hidden;
  }
  .modal-main { display: grid; flex: 1 1 0; min-width: 0; gap: 22px; }
  .modal-actions {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    justify-content: end;
    gap: 12px;
    padding-top: 2px;
  }
  .ghost-button {
    border: 0;
    padding: 10px 14px;
    border-radius: 999px;
    background: var(--color-surface-ghost-button);
    color: var(--color-accent-button-text);
    white-space: nowrap;
  }
  .primary-button {
    border: 1px solid var(--color-border-soft);
    border-radius: 999px;
    padding: 11px 16px;
    background: var(--color-accent-fill);
    color: var(--color-primary-button-text);
    font-weight: 700;
    box-shadow: 0 18px 40px var(--color-shadow-button);
  }
  button:hover { filter: brightness(0.98); }
  button:disabled {
    cursor: not-allowed;
    filter: none;
    box-shadow: none;
    opacity: 0.55;
  }
  .primary-button:disabled,
  .ghost-button:disabled {
    background: var(--color-surface-disabled);
    color: var(--color-text-soft);
  }
  @media (max-width: 1080px) {
    .modal-layout { flex-direction: column; align-items: stretch; }
    .modal-sidebar { flex: 0 0 auto; width: 100%; position: relative; }
    .modal-actions { grid-auto-flow: row; grid-auto-columns: 1fr; justify-content: stretch; }
  }
  @media (max-width: 900px) {
    .modal-card { max-height: calc(100dvh - 28px); }
  }
  @media (max-width: 640px) {
    .modal-header { flex-direction: column; align-items: start; }
  }
`)
export class EditPage extends JSXElement {
  @state() accessor props!: { model: EditPageModel | null; };
  @state() private accessor hasSidebar = false;
  private retainedModel: EditPageModel | null = null;

  private readonly updateSidebar = (event: Event) => {
    this.hasSidebar = (event.currentTarget as HTMLSlotElement).assignedElements().length > 0;
  };

  private readonly afterClose = () => {
    if (this.props.model) return;
    this.retainedModel = null;
    this.requestUpdate();
  };

  protected render() {
    if (this.props.model) this.retainedModel = this.props.model;
    const model = this.retainedModel;
    this.toggleAttribute("open", !!model);
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
          <aside class="modal-sidebar" hidden={!this.hasSidebar}>
            <slot name="sidebar" onslotchange={this.updateSidebar} />
          </aside>
          <div class="modal-main">
            <slot name="editor" />
            <slot name="preview" />
            <footer class="modal-actions">
              <button class="ghost-button" type="button" onclick={model.onClose} disabled={model.saving}>{model.onSave ? "Cancel" : "Close"}</button>
              {model.onSave ? <button class="primary-button" type="button" onclick={model.onSave} disabled={model.saving}>
                {model.saving ? "Saving..." : model.saveLabel ?? (model.mode === "create" ? "Create" : "Save changes")}
              </button> : null}
            </footer>
          </div>
        </div>}
        {model.error ? (
          // <footer class="modal-header" role="alert" aria-live="polite"></footer>
          <FeedbackNotice
            onDismiss={model.onDismissError}
            title="Failed to save"
            tone="error"
            webjsx-attr-role="alert"
            webjsx-attr-aria-live="polite"
          >
            <pre style="white-space: break-spaces;">
              {SendError.errorString(model.error)}
            </pre>
          </FeedbackNotice>
        ) : null}
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
      }, () => { });
    }, () => { });
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
  children?: JSX.Node;
  onDismiss?: () => void;
}

@customElement("mws-feedback-notice")
@addstyles(`
  :host { display: block; }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  .app-feedback-notice {
    --notice-color: var(--color-feedback-info);
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) auto;
    align-items: start;
    gap: 14px;
    padding: 16px 18px;
    border: 1px solid var(--color-border-soft);
    border-left: 4px solid var(--notice-color);
    border-radius: 8px;
    background: var(--color-surface-panel-strong);
    background: color-mix(in srgb, var(--notice-color) 7%, var(--color-surface-card));
  }
  .is-success { --notice-color: var(--color-feedback-success); }
  .is-warning { --notice-color: var(--color-feedback-warning); }
  .is-error { --notice-color: var(--color-danger); }
  .app-feedback-icon {
    display: flex;
    color: var(--notice-color);
    padding-top: 2px;
  }
  .app-feedback-icon material-symbol,
  .app-feedback-icon svg {
    display: block;
    width: 24px;
    height: 24px;
  }
  material-symbol svg { fill: currentColor; }
  .app-feedback-message {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .app-feedback-message h2 {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--color-text-strong);
  }
  .app-feedback-body {
    display: block;
    color: var(--color-text-muted);
    line-height: 1.6;
  }
  ::slotted(*) { margin-top: 4px; }
  ::slotted(p),
  ::slotted(pre) { margin: 4px 0 0; }
  ::slotted(pre) {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 0.88rem;
    max-height: 240px;
    overflow: auto;
  }
  .app-feedback-dismiss {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 8px;
    margin-top: -4px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--color-text-muted);
    font: inherit;
    cursor: pointer;
  }
  .app-feedback-dismiss:hover {
    background: var(--color-border-soft);
    color: var(--color-text-strong);
  }
  .app-feedback-dismiss:focus-visible {
    outline: 2px solid var(--notice-color);
    outline-offset: 2px;
  }
  .app-feedback-dismiss material-symbol,
  .app-feedback-dismiss svg {
    display: block;
    width: 20px;
    height: 20px;
  }
  @media (max-width: 640px) {
    .app-feedback-notice {
      gap: 10px;
      padding: 14px 12px;
    }
  }
`)
export class FeedbackNotice extends JSXElement {
  @state() accessor props!: FeedbackNoticeProps;

  protected render() {
    const { title, tone = "info", onDismiss } = this.props;
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
        <slot class="app-feedback-body" />
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