// Generated using Claude 3.7 Sonnet Thinking on 2025-03-25. 

import "./bootprefix";
import * as prefix from "tiddlywiki/boot/bootprefix";

declare module "tiddlywiki" {
  function TiddlyWiki(tw?: prefix.TW): TW;

  // Augment the existing TW interface with boot.js functionality
  interface TW {
    utils: TWUtils;
    wiki: Wiki;
    crypto: TWCrypto;
    Wiki: WikiConstructor;
    Tiddler: TiddlerConstructor;
    hooks: TWHooks;
    safeMode?: boolean;
    locationHash: string;
    packageInfo: any;
    boot: TWBootNode;
    addUnloadTask(task: (event: BeforeUnloadEvent) => any): void;
    unloadTasks: Array<(event: BeforeUnloadEvent) => any>;
    modules: TWModules;
    passwordPrompt?: PasswordPrompt;
    sjcl: any;

    // Node.js specific file loading functions
    loadTiddlersFromFile(filepath: string, fields?: TiddlerFields): FileInfoTiddlers;
    loadMetadataForFile(filepath: string): TiddlerFields | null;
    loadTiddlersFromPath(filepath: string, excludeRegExp?: RegExp): FileInfoTiddlers[];
    loadTiddlersFromSpecification(filepath: string, excludeRegExp?: RegExp): FileInfoTiddlers[];
    loadPluginFolder(filepath: string, excludeRegExp?: RegExp): TiddlerFields | null;
    findLibraryItem(name: string, paths: string[]): string | null;
    getLibraryItemSearchPaths(libraryPath: string, envVar?: string): string[];
    loadPlugins(plugins: string[], libraryPath: string, envVar?: string): void;
    loadWikiTiddlers(wikiPath: string, options?: WikiLoadOptions): any;
    loadTiddlersNode(): void;
    loadTiddlersBrowser(): void;
  }

  interface TWConfig {

    pluginsPath: string;
    themesPath: string;
    languagesPath: string;
    editionsPath: string;
    wikiInfo: string;
    wikiPluginsSubDir: string;
    wikiThemesSubDir: string;
    wikiLanguagesSubDir: string;
    wikiTiddlersSubDir: string;
    wikiOutputSubDir: string;
    jsModuleHeaderRegExpString: string;
    fileExtensionInfo: Record<string, { type: string }>;
    contentTypeInfo: Record<string, {
      encoding: string;
      extension: string | string[];
      flags?: string[];
      deserializerType?: string;
    }>;
    pluginsEnvVar: string;
    themesEnvVar: string;
    languagesEnvVar: string;
    editionsEnvVar: string;
    maxEditFileSize: number;
  }

  interface TWBootBase {
    log(str: string): void;
    logMessages?: string[];
    argv: string[];
    remainingStartupModules?: StartupModule[];
    executedStartupModules?: Record<string, boolean>;
    disabledStartupModules?: string[];
    executeNextStartupTask(callback?: () => void): boolean;
    doesTaskMatchPlatform(taskModule: StartupModule): boolean;
    isStartupTaskEligible(taskModule: StartupModule): boolean;
    decryptEncryptedTiddlers(callback: () => void): void;
    initStartup(options: BootOptions): void;
    loadStartup(options: BootOptions): void;
    execStartup(options: BootOptions): void;
    startup(options?: BootOptions): void;
    boot(callback?: () => void): void;
  }

  interface TWBootBrowser extends TWBootBase {
    bootPath: undefined;
    corePath: undefined;
    wikiPath: undefined;
    wikiInfo: undefined;
    files: undefined;
    wikiTiddlersPath: undefined;
    extraPlugins?: string[];
  }

  interface TWBootNode extends TWBootBase {
    bootPath: string;
    corePath: string;
    wikiPath: string;
    files: Record<string, FileInfo>;
    extraPlugins: string[];
    wikiInfo: object | null;
    wikiTiddlersPath: string;
  }

  // Options for boot functions
  interface BootOptions {
    callback?: () => void;
    bootPath?: string;
  }

  // Startup module interface
  interface StartupModule {
    name?: string;
    platforms?: string[];
    after?: string[];
    before?: string[];
    synchronous?: boolean;
    startup: (callback?: () => void) => void;
  }

  // File info interface
  interface FileInfo {
    filepath: string;
    type: string;
    hasMetaFile: boolean;
    isEditableFile: boolean;
    originalpath?: string;
  }

  // Additional interfaces for Node.js file operations
  interface FileInfoTiddlers {
    filepath: string;
    type: string;
    tiddlers: TiddlerFields[];
    hasMetaFile: boolean;
    isEditableFile?: boolean;
  }

  interface WikiLoadOptions {
    parentPaths?: string[];
    readOnly?: boolean;
    [key: string]: any;
  }

  // Utils interface for all utility functions
  interface TWUtils {
    // Core utility functions
    hop(object: any, property: string): boolean;
    isArray(value: any): boolean;
    isArrayEqual(array1: any[], array2: any[]): boolean;
    insertSortedArray(array: string[], value: string): string[];
    pushTop(array: any[], value: any | any[]): any[];
    isDate(value: any): boolean;
    each(object: any, callback: (element: any, title: string, object: any) => any): void;
    domMaker(tag: string, options?: DomMakerOptions): HTMLElement;
    error(err: string): void;
    extend(object: any, ...sourceObjects: any[]): any;
    deepDefaults(object: any, ...sourceObjects: any[]): any;
    decodeURIComponentSafe(s: string): string;
    decodeURISafe(s: string): string;
    htmlDecode(s: string): string;
    getLocationHash(): string;
    pad(value: number | string, length?: number): string;
    stringifyDate(value: Date): string;
    parseDate(value: string | Date): Date | null;
    stringifyList(value: string[]): string;
    parseStringArray(value: string | string[], allowDuplicate?: boolean): string[] | null;
    parseFields(text: string, fields?: Record<string, any>): Record<string, any>;
    parseJSONSafe<T>(text: string, defaultJSON?: T | ((e: Error) => T)): T;
    resolvePath(sourcepath: string, rootpath: string): string;
    parseVersion(version: string): VersionInfo | null;
    compareVersions(versionStringA: string, versionStringB: string): -1 | 0 | 1;
    checkVersions(versionStringA: string, versionStringB: string): boolean;
    registerFileType(type: string, encoding: string, extension: string | string[], options?: FileTypeOptions): void;
    getFileExtensionInfo(ext: string): { type: string } | null;
    getTypeEncoding(ext: string): string;
    evalGlobal(code: string, context: any, filename: string, sandbox?: any, allowGlobals?: boolean): any;
    evalSandboxed(code: string, context: any, filename: string, allowGlobals?: boolean): any;
    sandbox?: any;
    PasswordPrompt: PasswordPromptConstructor;
    Crypto: CryptoConstructor;
  }

  // DOM maker options
  interface DomMakerOptions {
    namespace?: string;
    document?: Document;
    attributes?: Record<string, string>;
    style?: Record<string, string>;
    text?: string;
    children?: HTMLElement[];
    innerHTML?: string;
    class?: string;
    eventListeners?: EventListenerInfo[];
  }

  interface EventListenerInfo {
    name: string;
    handlerFunction: EventListenerOrEventListenerObject;
    useCapture?: boolean;
  }

  // File type registration options
  interface FileTypeOptions {
    flags?: string[];
    deserializerType?: string;
  }

  // Version info interface
  interface VersionInfo {
    version: string;
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
    build?: string;
  }

  // Password prompt constructor
  interface PasswordPromptConstructor {
    new(): PasswordPrompt;
  }

  // Password prompt instance
  interface PasswordPrompt {
    passwordPrompts: Array<PromptInfo>;
    promptWrapper: HTMLElement;
    setWrapperDisplay(): void;
    createPrompt(options: PromptOptions): PromptInfo;
    removePrompt(promptInfo: PromptInfo): void;
  }

  interface PromptInfo {
    serviceName: string;
    callback: (data: any) => boolean;
    form: HTMLFormElement;
    owner: PasswordPrompt;
  }

  interface PromptOptions {
    submitText?: string;
    serviceName: string;
    noUserName?: boolean;
    canCancel?: boolean;
    repeatPassword?: boolean;
    callback: (data: any) => boolean;
  }

  // Crypto constructor
  interface CryptoConstructor {
    new(): TWCrypto;
  }

  // Crypto instance
  interface TWCrypto {
    setPassword(newPassword: string): void;
    updateCryptoStateTiddler(): void;
    hasPassword(): boolean;
    encrypt(text: string, password?: string): string;
    decrypt(text: string, password?: string): string;
  }

  // Hooks interface
  interface TWHooks {
    names: Record<string, Array<(...args: any[]) => any>>;
    addHook(hookName: string, definition: (...args: any[]) => any): void;
    removeHook(hookName: string, definition: (...args: any[]) => any): void;
    invokeHook(hookName: string, ...args: any[]): any;
  }

  // this interface is based on tw5-typed
  interface IHooksKnown {
    "th-before-importing": [tiddler: Tiddler];
    "th-boot-tiddlers-loaded": [];
    "th-cancelling-tiddler": [event: unknown];
    "th-closing-tiddler": [event: unknown];
    "th-deleting-tiddler": [title: string];
    "th-editing-tiddler": [event: unknown];
    "th-importing-file": [props: { callback: Function; file: { name: string; path?: string }; isBinary: boolean; type: string }];
    "th-importing-tiddler": [tiddler: Tiddler];
    "th-make-tiddler-path": [fullPath: string, fullPath: string];
    "th-navigating": [event: unknown];
    "th-new-tiddler": [event: unknown];
    "th-opening-default-tiddlers-list": [storyList: string[]];
    "th-page-refreshed": [];
    "th-page-refreshing": [];
    "th-relinking-tiddler": [toTiddler: Tiddler, fromTiddler: Tiddler];
    "th-renaming-tiddler": [toTiddler: Tiddler, fromTiddler: Tiddler];
    /** parseTreeNodes: IParseTreeNode | null, widget: Widget */
    "th-rendering-element": [parseTreeNodes: any, widget: any];
    "th-saving-tiddler": [toTiddler: Tiddler, fromTiddler: Tiddler];
    "th-server-command-post-start": [server: ServerClass, nodeServer: any, who: 'tiddlywiki' | 'mws'];
  }

  interface ServerClass {

  }

  // Wiki class interface
  interface Wiki {
    tiddlerExists(title: string): boolean;
    isShadowTiddler(title: string): boolean;
    getShadowSource(title: string): string | null;
    getTiddler(title: string): Tiddler | undefined;
    addTiddler(tiddler: Tiddler | TiddlerFields): void;
    addTiddlers(tiddlers: (Tiddler | TiddlerFields)[]): void;
    deleteTiddler(title: string): void;
    allTitles(): string[];
    each(callback: (tiddler: Tiddler, title: string) => void): void;
    allShadowTitles(): string[];
    eachShadow(callback: (tiddler: Tiddler, title: string) => void): void;
    eachTiddlerPlusShadows(callback: (tiddler: Tiddler, title: string) => void): void;
    eachShadowPlusTiddlers(callback: (tiddler: Tiddler, title: string) => void): void;
    getPluginTypes(): string[];
    readPluginInfo(titles?: string[]): { modifiedPlugins: string[], deletedPlugins: string[] };
    getPluginInfo(title: string): any;
    registerPluginTiddlers(pluginType: string | null, titles?: string[]): string[];
    unregisterPluginTiddlers(pluginType: string | null, titles?: string[]): string[];
    unpackPluginTiddlers(): void;
    clearCache(title: string | null): void;
    clearGlobalCache(): void;
    enqueueTiddlerEvent(title: string, removed?: boolean): void;
    defineTiddlerModules(): void;
    defineShadowModules(): void;
    processSafeMode(): void;
    deserializeTiddlers(type: string, text: string, srcFields?: TiddlerFields, options?: DeserializeOptions): TiddlerFields[];
  }

  // Constructor interface for Wiki
  interface WikiConstructor {
    new(options?: WikiOptions): Wiki;
    tiddlerDeserializerModules: Record<string, (text: string, fields: TiddlerFields, type?: string) => TiddlerFields[]>;
    parsers: any;
  }

  interface WikiOptions {
    enableIndexers?: string[] | null;
    [key: string]: any;
  }

  interface DeserializeOptions {
    deserializer?: string;
    [key: string]: any;
  }

  // Constructor interface for Tiddler
  interface TiddlerConstructor {
    new(...tiddlers: (Tiddler | TiddlerFields)[]): Tiddler;
    fieldModules: Record<string, TiddlerFieldModule>;
  }

  // Tiddler interface
  interface Tiddler {
    fields: TiddlerFields;
    cache: Record<string, any>;
    hasField(field: string): boolean;
    isEqual(tiddler: Tiddler, excludeFields?: string[]): boolean;
  }

  // Tiddler fields interface
  interface TiddlerFields {
    title?: string;
    text?: string;
    type?: string;
    tags?: string | string[];
    [key: string]: any;
  }

  // Tiddler field module interface
  interface TiddlerFieldModule {
    name: string;
    parse?: (value: any) => any;
    stringify?: (value: any) => string;
    editTag?: string;
    editType?: string;
  }

}