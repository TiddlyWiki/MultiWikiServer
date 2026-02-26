/**
 * IndexedDB Key-Value Store
 * A simple and efficient key-value store built on IndexedDB
 */

/**
 * Configuration options for IndexedDB key-value store
 * @interface KVStoreOptions
 */
export interface KVStoreOptions {
  /** The name of the IndexedDB database (defaults to 'kvStore') */
  dbName?: string;
  /** The name of the object store within the database (defaults to 'keyValuePairs') */
  storeName?: string;
  /** The database schema version number (defaults to 1) */
  version?: number;
}

/**
 * Wrapper around IDBCursorWithValue with generator-based methods.
 * Provides a more ergonomic API for cursor operations with generator support.
 * @template T The type of values stored in the cursor
 */
export class KVStoreCursor<T = any> {
  /**
   * Creates a new KVStoreCursor wrapping an IDBCursorWithValue
   * @param {IDBCursorWithValue} cursor - The underlying IndexedDB cursor
   */
  constructor(private cursor: IDBCursorWithValue) { }

  /**
   * The key of the current cursor position
   * @returns {IDBValidKey} The current key
   */
  get key(): IDBValidKey {
    return this.cursor.key;
  }

  /**
   * The primary key of the current cursor position
   * @returns {IDBValidKey} The primary key
   */
  get primaryKey(): IDBValidKey {
    return this.cursor.primaryKey;
  }

  /**
   * The value at the current cursor position
   * @returns {T} The current value
   */
  get value(): T {
    return this.cursor.value;
  }

  /**
   * The direction of cursor traversal
   * @returns {IDBCursorDirection} The cursor direction ('next', 'prev', etc.)
   */
  get direction(): IDBCursorDirection {
    return this.cursor.direction;
  }

  /**
   * The object store or index that the cursor is iterating
   * @returns {IDBObjectStore | IDBIndex} The source of the cursor
   */
  get source(): IDBObjectStore | IDBIndex {
    return this.cursor.source;
  }

  /**
   * Advances the cursor to the next position along its direction.
   * @param {IDBValidKey} [key] - Optional key to continue to
   * @returns {void}
   */
  continue(key?: IDBValidKey): void {
    this.cursor.continue(key);
  }

  /**
   * Sets the cursor to the given key and primary key.
   * Only valid for cursors over indexes.
   * @param {IDBValidKey} key - The key to continue to
   * @param {IDBValidKey} primaryKey - The primary key to continue to
   * @returns {void}
   */
  continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): void {
    this.cursor.continuePrimaryKey(key, primaryKey);
  }

  /**
   * Advances the cursor by the specified number of positions.
   * @param {number} count - The number of positions to advance
   * @returns {void}
   */
  advance(count: number): void {
    this.cursor.advance(count);
  }

  /**
   * Deletes the record at the cursor's current position.
   * Generator-based method that yields the delete request.
   * @yields {IDBRequest} The delete request
   * @returns {Generator<IDBRequest, void, unknown>}
   */
  *delete(): Generator<IDBRequest, void, unknown> {
    const request = this.cursor.delete();
    yield request;
  }

  /**
   * Updates the record at the cursor's current position.
   * Generator-based method that yields the update request.
   * @param {T} value - The new value to store
   * @yields {IDBRequest} The update request
   * @returns {Generator<IDBRequest, IDBValidKey, unknown>} Generator that returns the key of the updated record
   */
  *update(value: T): Generator<IDBRequest, IDBValidKey, unknown> {
    const request = this.cursor.update(value);
    yield request;
    return request.result;
  }
}

/**
 * Transaction-level key-value store operations.
 * Provides generator-based methods for performing operations within an active transaction.
 * All methods yield IDBRequests that resolve synchronously within the transaction context.
 */
export class KVStoreTransaction {
  private store: IDBObjectStore;

  /**
   * Creates a new transaction-level store wrapper
   * @param {IDBTransaction} transaction - The active IndexedDB transaction
   * @param {string} storeName - The name of the object store to operate on
   */
  constructor(
    private transaction: IDBTransaction,
    storeName: string
  ) {
    this.store = transaction.objectStore(storeName);
  }

  /**
   * Retrieves a value by its key from the store.
   * @template T The type of the value to retrieve
   * @param {IDBValidKey} key - The key to look up
   * @yields {IDBRequest} The get request
   * @returns {Generator<IDBRequest, T | undefined, unknown>} Generator that returns the value or undefined if not found
   * @example
   * const value = yield* tx.get('myKey');
   */
  *get<T = any>(key: IDBValidKey): Generator<IDBRequest, T | undefined, unknown> {
    const request = this.store.get(key);
    yield request;
    return request.result;
  }

  /**
   * Stores or updates a key-value pair in the store.
   * @param {IDBValidKey} key - The key to store the value under
   * @param {any} value - The value to store
   * @yields {IDBRequest} The put request
   * @returns {Generator<IDBRequest, IDBValidKey, unknown>} Generator that returns the key of the stored item
   * @example
   * yield* tx.set('myKey', { data: 'value' });
   */
  *set(key: IDBValidKey, value: any): Generator<IDBRequest, IDBValidKey, unknown> {
    const request = this.store.put(value, key);
    yield request;
    return request.result;
  }

  /**
   * Deletes a key-value pair from the store.
   * @param {IDBValidKey} key - The key to delete
   * @yields {IDBRequest} The delete request
   * @returns {Generator<IDBRequest, void, unknown>}
   * @example
   * yield* tx.delete('myKey');
   */
  *delete(key: IDBValidKey): Generator<IDBRequest, void, unknown> {
    const request = this.store.delete(key);
    yield request;
  }

  /**
   * Checks if a key exists in the store.
   * @param {IDBValidKey} key - The key to check
   * @yields {IDBRequest} The get request
   * @returns {Generator<IDBRequest, boolean, unknown>} Generator that returns true if the key exists
   * @example
   * const exists = yield* tx.has('myKey');
   */
  *has(key: IDBValidKey): Generator<IDBRequest, boolean, unknown> {
    const value = yield* this.get(key);
    return value !== undefined;
  }

  /**
   * Removes all key-value pairs from the store.
   * @yields {IDBRequest} The clear request
   * @returns {Generator<IDBRequest, void, unknown>}
   * @example
   * yield* tx.clear();
   */
  *clear(): Generator<IDBRequest, void, unknown> {
    const request = this.store.clear();
    yield request;
  }

  /**
   * Returns the number of key-value pairs in the store.
   * @yields {IDBRequest} The count request
   * @returns {Generator<IDBRequest, number, unknown>} Generator that returns the count
   * @example
   * const count = yield* tx.size();
   */
  *size(): Generator<IDBRequest, number, unknown> {
    const request = this.store.count();
    yield request;
    return request.result;
  }

  /**
   * Explicitly commits the transaction.
   * Note: Transactions auto-commit when the generator completes successfully.
   * Only available in browsers that support the commit() method.
   * @returns {void}
   */
  commit(): void {
    if ('commit' in this.transaction) {
      (this.transaction as any).commit();
    }
  }

  /**
   * Aborts the transaction, rolling back all changes.
   * @returns {void}
   */
  abort(): void {
    this.transaction.abort();
  }

  /**
   * Provides access to the underlying IDBTransaction object.
   * @returns {IDBTransaction} The raw IndexedDB transaction
   */
  get raw(): IDBTransaction {
    return this.transaction;
  }
}

/**
 * Database-level key-value store.
 * Provides both promise-based convenience methods and transaction-level control.
 * Supports generator-based transactions for atomic operations.
 * @example
 * const db = new IndexedDBKVStore({ dbName: 'myApp' });
 * await db.open();
 * 
 * // Simple operations
 * await db.set('key', 'value');
 * const value = await db.get('key');
 * 
 * // Atomic transactions
 * await db.run('readwrite', function* (tx) {
 *   const count = yield* tx.get('counter');
 *   yield* tx.set('counter', count + 1);
 * });
 */
export class IndexedDBKVStore {
  private dbName: string;
  private storeName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  /**
   * Creates a new IndexedDB key-value store
   * @param {KVStoreOptions} [options={}] - Configuration options
   */
  constructor(options: KVStoreOptions = {}) {
    this.dbName = options.dbName || 'kvStore';
    this.storeName = options.storeName || 'keyValuePairs';
    this.version = options.version || 1;
  }

  /**
   * Opens the IndexedDB database.
   * Must be called before performing any operations.
   * Creates the object store if it doesn't exist during upgrade.
   * @returns {Promise<IDBDatabase>} Promise that resolves to the database instance
   * @throws {Error} If the database fails to open
   * @example
   * await db.open();
   */
  async open(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };
    });
  }

  /**
   * Creates and returns a new transaction-level store.
   * Use this for manual transaction control with generators.
   * @param {IDBTransactionMode} [mode='readonly'] - Transaction mode ('readonly', 'readwrite', or 'versionchange')
   * @returns {KVStoreTransaction} Transaction-level store with generator methods
   * @throws {Error} If the database is not opened
   * @example
   * const tx = db.transaction('readwrite');
   * const value = yield* tx.get('key');
   */
  transaction(mode: IDBTransactionMode = 'readonly'): KVStoreTransaction {
    if (!this.db) {
      throw new Error('Database not opened. Call open() first.');
    }

    const transaction = this.db.transaction([this.storeName], mode);
    return new KVStoreTransaction(transaction, this.storeName);
  }

  /**
   * Executes a transaction with a generator function.
   * Automatically handles request resolution and error propagation.
   * The transaction commits on success or aborts on error.
   * All operations execute synchronously within the transaction context.
   * @template T The return type of the transaction function
   * @param {IDBTransactionMode} mode - Transaction mode ('readonly' or 'readwrite')
   * @param {Function} fn - Generator function that receives a KVStoreTransaction
   * @returns {Promise<T>} Promise that resolves with the transaction result
   * @throws {Error} If any operation fails or the transaction is aborted
   * @example
   * const result = await db.run('readwrite', function* (tx) {
   *   const user = yield* tx.get('user');
   *   yield* tx.set('lastLogin', Date.now());
   *   return user;
   * });
   */
  run<T>(
    mode: IDBTransactionMode,
    fn: (tx: KVStoreTransaction) => Generator<IDBRequest, T, any>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const tx = this.transaction(mode);

      try {
        const gen = fn(tx);
        let finalValue: T;

        // Process the result of gen.next() or gen.throw()
        const processNext = (result: IteratorResult<IDBRequest, T>) => {
          try {
            if (result.done) {
              finalValue = result.value;
              return;
            }

            // Set up handlers for the next request
            const request = result.value;
            request.onsuccess = () => {
              processNext(gen.next(request.result));
            };
            request.onerror = () => {
              const error = new Error(`Request failed: ${request.error?.message}`);
              try {
                // Throw the error back into the generator
                processNext(gen.throw(error));
              } catch (thrownError) {
                // Generator didn't catch the error
                tx.abort();
                reject(thrownError);
              }
            };
          } catch (error) {
            tx.abort();
            reject(error);
          }
        };

        // Start processing
        processNext(gen.next());

        // Wait for transaction to complete
        tx.raw.oncomplete = () => resolve(finalValue);
        tx.raw.onerror = () => reject(new Error(`Transaction failed: ${tx.raw.error?.message}`));
        tx.raw.onabort = () => reject(new Error('Transaction aborted'));
      } catch (error) {
        tx.abort();
        reject(error as Error);
      }
    });
  }

  /**
   * Closes the database connection.
   * Should be called when done using the database.
   * @returns {void}
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Deletes the entire database.
   * Closes the connection first if open.
   * @returns {Promise<void>} Promise that resolves when the database is deleted
   * @throws {Error} If deletion fails or is blocked
   */
  async destructivelyDeleteDatabase(seriously?: "yes! really delete data!"): Promise<void> {
    if (seriously !== "yes! really delete data!")
      throw new Error("Destructive delete requires explicit confirmation");

    this.close();

    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete database: ${request.error?.message}`));
      request.onblocked = () => reject(new Error('Database deletion blocked - close all connections'));
    });
  }

  /**
   * Retrieves a value by its key (convenience method).
   * Creates a readonly transaction automatically.
   * @template T The type of the value to retrieve
   * @param {IDBValidKey} key - The key to look up
   * @returns {Promise<T | undefined>} Promise that resolves to the value or undefined
   * @example
   * const user = await db.get('user');
   */
  async get<T = any>(key: IDBValidKey): Promise<T | undefined> {
    return this.run('readonly', function* (tx) {
      return yield* tx.get<T>(key);
    });
  }

  /**
   * Retrieves all values from the store (convenience method).
   * @template T The type of values to retrieve
   * @param query - Key or key range to filter results
   * @param count - Maximum number of results to retrieve
   * @returns Promise that resolves to an array of values
   * @example
   * const users = await db.getAll();
   */
  getAll<T = any>(query?: IDBValidKey | IDBKeyRange | null | undefined, count?: number) {
    return new Promise<T[]>((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not opened'));
      const request = this.db.transaction([this.storeName], 'readonly').objectStore(this.storeName).getAll(query, count);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to get all records: ${request.error?.message}`));
    });
  }

  /**
   * Stores or updates a key-value pair (convenience method).
   * Creates a readwrite transaction automatically.
   * @param {IDBValidKey} key - The key to store the value under
   * @param {any} value - The value to store
   * @returns {Promise<IDBValidKey>} Promise that resolves to the stored key
   * @example
   * await db.set('user', { name: 'John', age: 30 });
   */
  async set(key: IDBValidKey, value: any): Promise<IDBValidKey> {
    return this.run('readwrite', function* (tx) {
      return yield* tx.set(key, value);
    });
  }

  /**
   * Deletes a key-value pair (convenience method).
   * Creates a readwrite transaction automatically.
   * @param {IDBValidKey} key - The key to delete
   * @returns {Promise<void>} Promise that resolves when deletion is complete
   * @example
   * await db.delete('user');
   */
  async delete(key: IDBValidKey): Promise<void> {
    return this.run('readwrite', function* (tx) {
      yield* tx.delete(key);
    });
  }

  /**
   * Checks if a key exists in the store (convenience method).
   * Creates a readonly transaction automatically.
   * @param {IDBValidKey} key - The key to check
   * @returns {Promise<boolean>} Promise that resolves to true if the key exists
   * @example
   * if (await db.has('user')) { ... }
   */
  async has(key: IDBValidKey): Promise<boolean> {
    return this.run('readonly', function* (tx) {
      return yield* tx.has(key);
    });
  }

  /**
   * Removes all key-value pairs from the store (convenience method).
   * Creates a readwrite transaction automatically.
   * @returns {Promise<void>} Promise that resolves when all data is cleared
   * @example
   * await db.clear();
   */
  async clear(): Promise<void> {
    return this.run('readwrite', function* (tx) {
      yield* tx.clear();
    });
  }

  /**
   * Returns the number of key-value pairs in the store (convenience method).
   * Creates a readonly transaction automatically.
   * @returns {Promise<number>} Promise that resolves to the count
   * @example
   * const count = await db.size();
   */
  async size(): Promise<number> {
    return this.run('readonly', function* (tx) {
      return yield* tx.size();
    });
  }

  /**
   * Opens a cursor to iterate over the store.
   * The callback is executed synchronously for each cursor position.
   * Call cursor.continue() to advance to the next item.
   * @template T The type of values in the cursor
   * @param {IDBValidKey | IDBKeyRange | null | undefined} query - Key or key range to filter results
   * @param {IDBCursorDirection | undefined} direction - Direction to traverse ('next', 'prev', 'nextunique', 'prevunique')
   * @param {Function} callback - Function called with the cursor at each position
   * @returns {Promise<void>} Promise that resolves when iteration is complete
   * @throws {Error} If cursor creation fails or callback throws
   * @example
   * await db.openCursor(null, 'next', (cursor) => {
   *   while (cursor) {
   *     console.log(cursor.key, cursor.value);
   *     cursor.continue();
   *   }
   * });
   */
  openCursor<T = any>(
    query: IDBValidKey | IDBKeyRange | null | undefined,
    direction: IDBCursorDirection | undefined,
    callback: (cursor: KVStoreCursor<T> | null) => void
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not opened'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor(query, direction);

      request.onsuccess = () => {
        const cursor = request.result;
        try {
          callback(cursor ? new KVStoreCursor<T>(cursor) : null);
        } catch (error) {
          transaction.abort();
          reject(error);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to open cursor: ${request.error?.message}`));
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      transaction.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  /**
   * Provides access to the underlying IDBDatabase object.
   * Returns null if the database is not open.
   * @returns {IDBDatabase | null} The raw IndexedDB database or null
   */
  get raw(): IDBDatabase | null {
    return this.db;
  }
}

/**
 * Factory function to create a new IndexedDB key-value store instance.
 * @param {KVStoreOptions} [options] - Configuration options
 * @returns {IndexedDBKVStore} A new store instance
 * @example
 * const db = createKVStore({ dbName: 'myApp', version: 2 });
 */
export const createKVStore = (options?: KVStoreOptions): IndexedDBKVStore => {
  return new IndexedDBKVStore(options);
};

/**
 * Default singleton instance of the key-value store.
 * Uses default options (dbName: 'kvStore', storeName: 'keyValuePairs', version: 1).
 * @type {IndexedDBKVStore}
 * @example
 * import { defaultKVStore } from './indexeddb';
 * await defaultKVStore.open();
 * await defaultKVStore.set('key', 'value');
 */
export const defaultKVStore = new IndexedDBKVStore();
