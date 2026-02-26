

import { BehaviorSubject } from 'rxjs';
import { createKVStore } from '../utils/indexeddb';

// ── Entity types ─────────────────────────────────────────────────────────────

export interface BasicTemplate {
  id: string;
  type: 'basic';
  name: string;
  description: string;
  bags: string[];
  plugins: string[];
  requiredPluginsEnabled: boolean;
}

export interface AdvancedTemplate {
  id: string;
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
  id: string;
  name: string;
  description?: string;
}

export interface Wiki {
  id: string;
  name: string;
  description: string;
  template: string;
  writableBag: string;
}

export interface Plugin {
  id: string;
  path: string;
  description: string;
  enabled: boolean;
}

export class DataStore<T extends { id: string }> {
  private _store;
  readonly changes$ = new BehaviorSubject<T[]>([]);
  constructor(public name: string, private onupgrade?: (event: IDBVersionChangeEvent, db: IDBDatabase) => void) {
    this._store = createKVStore({
      dbName: 'mws',
      storeName: name,
      version: 2,
      onupgrade: this.onupgrade,
    });
  }

  async loadAll() {
    try {
      await this._store.open();
      this.changes$.next(await this._store.getAll());
      await this._store.close();
    } catch (error) {
      console.error(`Error loading ${this.name}:`, error);
      await this._store.close();
      throw error;
    }
  }

  async save(id: string, record: T): Promise<void> {
    try {
      await this._store.open();
      await this._store.set(id, record);
      this.changes$.next(await this._store.getAll());
      await this._store.close();
    } catch (error) {
      console.error(`Error saving ${this.name}:`, error);
      await this._store.close();
      throw error;
    }
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

class DataService {


  onupgrade = (event: IDBVersionChangeEvent, db: IDBDatabase) => {
    for (const storeName of ['bags', 'wikis', 'templates', 'plugins']) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    }
  }

  bags = new DataStore<Bag>('bags', this.onupgrade);
  wikis = new DataStore<Wiki>('wikis', this.onupgrade)
  templates = new DataStore<Template>('templates', this.onupgrade);
  plugins = new DataStore<Plugin>('plugins', this.onupgrade);


}

export const dataService = new DataService();