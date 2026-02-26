

import { BehaviorSubject, map } from 'rxjs';
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

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role_ids: string[];
  password: string;
}

export class DataStore<T extends { id: string }> {
  private _store;
  readonly changes$ = new BehaviorSubject<T[]>([]);
  constructor(public name: string) {
    this._store = createKVStore({
      dbName: DataService.dbName,
      storeName: name,
      version: DataService.version,
      onupgrade: DataService.onupgrade,
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
  static dbName = 'mws';
  static version = 3;
  static onupgrade = (event: IDBVersionChangeEvent, db: IDBDatabase) => {
    for (const storeName of ['bags', 'wikis', 'templates', 'plugins']) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    }
  }

  bags = new DataStore<Bag>('bags');
  wikis = new DataStore<Wiki>('wikis');
  templates = new DataStore<Template>('templates');
  plugins = new DataStore<Plugin>('plugins');
  roles = new DataStore<Role>('roles');
  users = new DataStore<User>('users');
}

export const dataService = new DataService();