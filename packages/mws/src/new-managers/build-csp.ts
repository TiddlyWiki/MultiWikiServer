import { ApplyHeaders, ServerRequest } from "@tiddlywiki/server";

export interface CSPSourceOptions {
  /**  a path ending in / also permits descendants. */
  sources: readonly string[];
}

export interface CSPBaseURIOptions extends CSPSourceOptions { type: "base-uri"; }
export interface CSPChildSrcOptions extends CSPSourceOptions { type: "child-src"; }
export interface CSPConnectSrcOptions extends CSPSourceOptions { type: "connect-src"; }
export interface CSPDefaultSrcOptions extends CSPSourceOptions { type: "default-src"; }
export interface CSPFencedFrameSrcOptions extends CSPSourceOptions { type: "fenced-frame-src"; }
export interface CSPFontSrcOptions extends CSPSourceOptions { type: "font-src"; }
export interface CSPFormActionOptions extends CSPSourceOptions { type: "form-action"; }
export interface CSPFrameAncestorsOptions extends CSPSourceOptions { type: "frame-ancestors"; }
export interface CSPFrameSrcOptions extends CSPSourceOptions { type: "frame-src"; }
export interface CSPImgSrcOptions extends CSPSourceOptions { type: "img-src"; }
export interface CSPManifestSrcOptions extends CSPSourceOptions { type: "manifest-src"; }
export interface CSPMediaSrcOptions extends CSPSourceOptions { type: "media-src"; }
export interface CSPObjectSrcOptions extends CSPSourceOptions { type: "object-src"; }
export interface CSPScriptSrcOptions extends CSPSourceOptions { type: "script-src"; }
export interface CSPScriptSrcAttrOptions extends CSPSourceOptions { type: "script-src-attr"; }
export interface CSPScriptSrcElemOptions extends CSPSourceOptions { type: "script-src-elem"; }
export interface CSPStyleSrcOptions extends CSPSourceOptions { type: "style-src"; }
export interface CSPStyleSrcAttrOptions extends CSPSourceOptions { type: "style-src-attr"; }
export interface CSPStyleSrcElemOptions extends CSPSourceOptions { type: "style-src-elem"; }
export interface CSPWorkerSrcOptions extends CSPSourceOptions { type: "worker-src"; }

/** Boolean options lift individual sandbox restrictions when true; false or omitted keeps them in place. Other browser restrictions still apply. */
export interface CSPSandboxOptions {
  /** Selects the CSP sandbox directive. With no allowances, all sandbox restrictions apply. */
  type: "sandbox";
  /**
   * Allows downloading files through an `<a>` or `<area>` element with the download
   * attribute, as well as through the navigation that leads to a download of a file.
   * This works regardless of whether the user clicked on the link, or JS code
   * initiated it without user interaction.
   */
  allowDownloads: boolean;
  /**
   * Allows the page to submit forms. If this keyword is not used, form will be
   * displayed as normal, but submitting it will not trigger input validation,
   * sending data to a web server or closing a dialog.
   */
  allowForms: boolean;
  /**
   * Allows the page to open modal windows by `Window.alert()`, `Window.confirm()`,
   * `Window.print()` and `Window.prompt()`, while opening a `<dialog>` is allowed
   * regardless of this keyword. It also allows the page to receive
   * `BeforeUnloadEvent` event.
   */
  allowModals: boolean;
  /** Lets the resource lock the screen orientation. */
  allowOrientationLock: boolean;
  /** Allows the page to use the Pointer Lock API. */
  allowPointerLock: boolean;
  /**
   * Allows popups (created, for example, by `Window.open()` or `target="_blank"`).
   * If this keyword is not used, popup display will silently fail.
   */
  allowPopups: boolean;
  /**
   * Allows a sandboxed document to open new windows without forcing the sandboxing
   * flags upon them. This will allow, for example, a third-party advertisement to be
   * safely sandboxed without forcing the same restrictions upon the page the ad
   * links to.
   */
  allowPopupsToEscapeSandbox: boolean;
  /** Allows embedders to have control over whether an iframe can start a presentation session. */
  allowPresentation: boolean;
  /**
   * Allows a sandboxed resource to retain its origin. A sandboxed resource is
   * otherwise treated as being from an opaque origin, which ensures that it will
   * always fail same-origin policy checks, and hence cannot access localstorage and
   * `document.cookie` and some JavaScript APIs. The Origin of sandboxed resources
   * without the allow-same-origin keyword is null.
   */
  allowSameOrigin: boolean;
  /**
   * Allows the page to run scripts (but not create pop-up windows). If this keyword
   * is not used, this operation is not allowed.
   */
  allowScripts: boolean;
  /** Lets the resource request access to the parent's storage capabilities with the Storage Access API. */
  allowStorageAccessByUserActivation: boolean;
  /** Lets the resource navigate the top-level browsing context (the one named `_top`). */
  allowTopNavigation: boolean;
  /** Lets the resource navigate the top-level browsing context, but only if initiated by a user gesture. */
  allowTopNavigationByUserActivation: boolean;
  /**
   * Allows navigations to non-http protocols built into browser or registered by a
   * website. This feature is also activated by allow-popups or allow-top-navigation
   * keyword.
   */
  allowTopNavigationToCustomProtocols: boolean;
}

export interface CSPReportToOptions {
  type: "report-to";
  group: string;
}

export interface CSPReportURIOptions {
  type: "report-uri";
  endpoints: readonly string[];
}

export interface CSPRequireTrustedTypesForOptions {
  type: "require-trusted-types-for";
  sinks: readonly "'script'"[];
}

export interface CSPTrustedTypesOptions {
  type: "trusted-types";
  policies: readonly string[];
  allowDuplicates?: boolean;
}

export interface CSPUpgradeInsecureRequestsOptions {
  type: "upgrade-insecure-requests";
  enabled?: boolean;
}

export type CSPOptions =
  | CSPBaseURIOptions | CSPChildSrcOptions | CSPConnectSrcOptions | CSPDefaultSrcOptions
  | CSPFencedFrameSrcOptions | CSPFontSrcOptions | CSPFormActionOptions | CSPFrameAncestorsOptions
  | CSPFrameSrcOptions | CSPImgSrcOptions | CSPManifestSrcOptions | CSPMediaSrcOptions | CSPObjectSrcOptions
  | CSPScriptSrcOptions | CSPScriptSrcAttrOptions | CSPScriptSrcElemOptions
  | CSPStyleSrcOptions | CSPStyleSrcAttrOptions | CSPStyleSrcElemOptions | CSPWorkerSrcOptions
  | CSPSandboxOptions | CSPReportToOptions | CSPReportURIOptions | CSPRequireTrustedTypesForOptions
  | CSPTrustedTypesOptions | CSPUpgradeInsecureRequestsOptions;

export type CSPDirective = CSPOptions["type"];

export class CSPBuilder {
  private readonly directives = new Map<CSPDirective, readonly string[]>();

  constructor(...options: CSPOptions[]) {
    for (const option of options)
      this.set(option);
  }

  set(options: CSPOptions): this {
    if (!/^[a-z][a-z0-9-]*$/.test(options.type))
      throw new Error("Invalid CSP directive name");

    let values: readonly string[];
    switch (options.type) {
      case "sandbox": {
        const flags: Record<Exclude<keyof CSPSandboxOptions, "type">, string> = {
          allowDownloads: "allow-downloads",
          allowForms: "allow-forms",
          allowModals: "allow-modals",
          allowOrientationLock: "allow-orientation-lock",
          allowPointerLock: "allow-pointer-lock",
          allowPopups: "allow-popups",
          allowPopupsToEscapeSandbox: "allow-popups-to-escape-sandbox",
          allowPresentation: "allow-presentation",
          allowSameOrigin: "allow-same-origin",
          allowScripts: "allow-scripts",
          allowStorageAccessByUserActivation: "allow-storage-access-by-user-activation",
          allowTopNavigation: "allow-top-navigation",
          allowTopNavigationByUserActivation: "allow-top-navigation-by-user-activation",
          allowTopNavigationToCustomProtocols: "allow-top-navigation-to-custom-protocols",
        };
        values = (Object.keys(flags) as (keyof typeof flags)[])
          .filter(flag => options[flag] === true)
          .map(flag => flags[flag]);
        break;
      }
      case "report-to":
        values = [options.group];
        break;
      case "report-uri":
        values = options.endpoints;
        break;
      case "require-trusted-types-for":
        values = options.sinks;
        break;
      case "trusted-types":
        values = options.allowDuplicates ? [...options.policies, "'allow-duplicates'"] : options.policies;
        break;
      case "upgrade-insecure-requests":
        if (options.enabled === false) {
          this.directives.delete(options.type);
          return this;
        }
        values = [];
        break;
      default:
        values = options.sources;
    }

    if (values.some(source => !source || /[\s;,\x00-\x1f\x7f]/.test(source)))
      throw new Error("CSP values must be individual tokens without whitespace, semicolons, commas, or control characters");

    this.directives.set(options.type, [...values]);
    return this;
  }

  toString(): string {
    return Array.from(this.directives, ([directive, values]) =>
      [directive, ...values].join(" ")
    ).join("; ");
  }
}

function buildCSP1(options: { type: "wiki", recipe_slug_encoded: string } | { type: "static" }, state: ServerRequest): ApplyHeaders {

  const assetSource = new URL(state.pathPrefix + state.config.rootRoutes.assets + "/", state.urlInfo).href;
  const pluginSource = new URL(state.pathPrefix + state.config.rootRoutes.cache + "/", state.urlInfo).href;
  const savingSource = options.type === "wiki"
    ? new URL(state.pathPrefix + state.config.rootRoutes.recipe + "/" + options.recipe_slug_encoded + "/", state.urlInfo).href
    : state.urlInfo.origin + state.pathPrefix + state.urlInfo.pathname;
  const isWiki = options.type === "wiki";
  return {
    crossOriginOpenerPolicy: "noopener-allow-popups",
    contentSecurityPolicy: new CSPBuilder()
      .set({
        type: "sandbox",
        allowForms: true,
        allowModals: true,
        allowOrientationLock: true,
        allowPointerLock: true,
        allowScripts: true,
        allowDownloads: true,
        allowPopups: false,
        allowPopupsToEscapeSandbox: false,
        allowPresentation: false,
        allowSameOrigin: true,
        allowStorageAccessByUserActivation: true,
        allowTopNavigation: true,
        allowTopNavigationByUserActivation: false,
        allowTopNavigationToCustomProtocols: false,
      })
      .set({ type: "default-src", sources: ["data:", "blob:"] })
      .set({ type: "base-uri", sources: isWiki ? [new URL(state.pathPrefix + "/", state.urlInfo).href] : [] })
      .set({ type: "script-src", sources: [assetSource, pluginSource, "'unsafe-inline'", "'unsafe-eval'"] })
      .set({ type: "style-src", sources: [assetSource, "'unsafe-inline'"] })
      .set({ type: "img-src", sources: [assetSource, "data:", "blob:"] })
      .set({ type: "font-src", sources: [assetSource, "data:", "blob:"] })
      .set({ type: "media-src", sources: [assetSource, "data:", "blob:"] })
      .set({ type: "connect-src", sources: [savingSource] })
      .set({ type: "form-action", sources: ["'none'"] })
      .set({ type: "frame-ancestors", sources: ["'none'"] })
      .set({ type: "worker-src", sources: ["data:", "blob:"] })
      // .set({ type: "upgrade-insecure-requests", enabled:  })
      .toString()
  }
}
