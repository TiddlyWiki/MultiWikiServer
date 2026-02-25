

import { BehaviorSubject } from 'rxjs';
import { createKVStore } from '../utils/indexeddb';

// ── Entity types ─────────────────────────────────────────────────────────────

export interface BasicTemplate {
  type: 'basic';
  name: string;
  description: string;
  bags: string[];
  plugins: string[];
  requiredPluginsEnabled: boolean;
}

export interface AdvancedTemplate {
  type: 'advanced';
  name: string;
  description: string;
  htmlFile: File | null;
  htmlContent: string;
  injectionArray: string;
  injectionLocation: string;
}

export type Template = BasicTemplate | AdvancedTemplate;

export interface Bag {
  name: string;
  description: string;
}

export interface Wiki {
  name: string;
  description: string;
  template: string;
  writableBag: string;
}

export interface Plugin {
  path: string;
  description: string;
  enabled: boolean;
}

// ── Service ───────────────────────────────────────────────────────────────────

class DataService {

  // ── Templates ──────────────────────────────────────────────────────────────

  private _templatesKV = createKVStore({
    dbName: 'mws-templates',
    storeName: 'templates',
    version: 1,
  });

  readonly templates$ = new BehaviorSubject<Template[]>([]);
  /** Derived select options — emits whenever templates$ emits */
  readonly templateOptions$ = new BehaviorSubject<{ value: string; label: string }[]>([]);

  async loadTemplates() {
    try {
      await this._templatesKV.open();
      const templates: Template[] = [];
      await this._templatesKV.openCursor(null, 'next', (cursor) => {
        if (cursor) { templates.push(cursor.value); cursor.continue(); }
      });
      this.templates$.next(templates);
      this.templateOptions$.next(templates.map(t => ({ value: t.name, label: t.name })));
      await this._templatesKV.close();
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  async saveTemplate(values: Record<string, any>): Promise<void> {
    try {
      await this._templatesKV.open();
      if (values.selectedTemplateType === 'basic') {
        const template: BasicTemplate = {
          type: 'basic',
          name: values.templateName,
          description: values.templateDescription,
          bags: (values.bags as string[]).filter((b: string) => b.trim()),
          plugins: (values.plugins as string[]).filter((p: string) => p.trim()),
          requiredPluginsEnabled: values.requiredPluginsEnabled,
        };
        await this._templatesKV.set(values.templateName, template);
      } else {
        const template: AdvancedTemplate = {
          type: 'advanced',
          name: values.templateName,
          description: values.templateDescription,
          htmlFile: values.htmlFile,
          htmlContent: values.htmlContent,
          injectionArray: values.injectionArray,
          injectionLocation: values.injectionLocation,
        };
        await this._templatesKV.set(values.templateName, template);
      }
      await this._templatesKV.close();
      await this.loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      await this._templatesKV.close();
      throw error;
    }
  }

  // ── Bags ───────────────────────────────────────────────────────────────────

  readonly bags$ = new BehaviorSubject<Bag[]>([]);

  async loadBags(): Promise<void> {
    // TODO: load from API
  }

  async saveBag(values: Record<string, any>): Promise<void> {
    // TODO: API call
    const bag: Bag = { name: values.bagName, description: values.bagDescription };
    this.bags$.next([...this.bags$.getValue(), bag]);
  }

  // ── Wikis ──────────────────────────────────────────────────────────────────

  readonly wikis$ = new BehaviorSubject<Wiki[]>([]);

  async loadWikis(): Promise<void> {
    // TODO: load from API
  }

  async saveWiki(values: Record<string, any>): Promise<void> {
    // TODO: API call
    const wiki: Wiki = {
      name: values.wikiName,
      description: values.wikiDescription,
      template: values.template,
      writableBag: values.writableBag,
    };
    this.wikis$.next([...this.wikis$.getValue(), wiki]);
  }

  // ── Plugins ────────────────────────────────────────────────────────────────

  readonly plugins$ = new BehaviorSubject<Plugin[]>([]);

  async loadPlugins(): Promise<void> {
    // TODO: load from API
  }

  async installPlugin(values: Record<string, any>): Promise<void> {
    // TODO: API call
    const plugin: Plugin = {
      path: values.pluginPath,
      description: values.pluginDescription,
      enabled: values.enabled,
    };
    this.plugins$.next([...this.plugins$.getValue(), plugin]);
  }
}

export const dataService = new DataService();