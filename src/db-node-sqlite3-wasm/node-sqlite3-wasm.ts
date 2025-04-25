import {
  BindValues,
  NormalQueryResult,
  QueryResult,
} from 'node-sqlite3-wasm';
import type {
  IsolationLevel,
  SqlDriverAdapter,
  SqlMigrationAwareDriverAdapterFactory,
  SqlQuery,
  SqlQueryable,
  SqlResultSet,
  Transaction,
  TransactionOptions,
} from '@prisma/driver-adapter-utils'
import { Debug, DriverAdapterError } from '@prisma/driver-adapter-utils'
import { Mutex } from 'async-mutex'
import { getColumnTypes, } from './conversion'
import { convertDriverError } from './errors'

import nsw from 'node-sqlite3-wasm';
const { Database } = nsw;
type Database = nsw.Database;

const debug = Debug('mws-db')
const packageName = 'mws-prisma-adapter-libsql'

type StdClient = Database
type TransactionClient = Database

const LOCK_TAG = Symbol()

class PrismaQueryable<ClientT extends StdClient | TransactionClient> implements SqlQueryable {
  readonly provider = 'sqlite'
  readonly adapterName = packageName;

  [LOCK_TAG] = new Mutex()

  constructor(protected readonly client: ClientT) { }

  /**
   * Execute a query given as SQL, interpolating the given parameters.
   */
  async queryRaw(query: SqlQuery): Promise<SqlResultSet> {
    const tag = '[js::query_raw]'
    debug(`${tag} %O`, query.sql)

    const release = await this[LOCK_TAG].acquire();
    let result: NormalQueryResult[] | null = null;

    try {
      result = this.client.all(query.sql, query.args as BindValues) as NormalQueryResult[];
    } catch (e) {
      this.onError(e)
    } finally {
      release()
    }

    debug(`${tag} %O`, result.length)

    const columns = Object.keys(result?.[0] ?? {});

    const rows = result.map(row => columns.map(column => row[column]!))
    const columnTypes = getColumnTypes(columns.map(e => ''), rows)


    return {
      columnNames: columns,
      columnTypes,
      rows,
    }
  }

  /**
   * Execute a query given as SQL, interpolating the given parameters and
   * returning the number of affected rows.
   * Note: Queryable expects a u64, but napi.rs only supports u32.
   */
  async executeRaw(query: SqlQuery): Promise<number> {
    const tag = '[js::execute_raw]'
    debug(`${tag} %O`, query.sql)

    const release = await this[LOCK_TAG].acquire();
    try {
      return this.client.run(query.sql, query.args as BindValues).changes ?? 0;
    } catch (e) {
      this.onError(e)
    } finally {
      release()
    }
  }


  protected onError(error: any): never {
    debug('Error: %O', error)
    throw new DriverAdapterError(convertDriverError(error))
  }
}

class PrismaTransaction extends PrismaQueryable<TransactionClient> implements Transaction {
  constructor(client: TransactionClient, readonly options: TransactionOptions, readonly unlockParent: () => void) {
    super(client)
  }

  async commit(): Promise<void> {
    debug(`[js::commit]`)

    try {
      await this.client.exec("COMMIT")
    } finally {
      this.unlockParent()
    }
  }

  async rollback(): Promise<void> {
    debug(`[js::rollback]`)

    try {
      await this.client.exec("ROLLBACK")
    } catch (error) {
      debug('error in rollback:', error)
    } finally {
      this.unlockParent()
    }
  }
}

export class PrismaAdapter extends PrismaQueryable<StdClient> implements SqlDriverAdapter {
  constructor(client: StdClient) {
    super(client)
  }

  async executeScript(script: string): Promise<void> {
    debug(`[js::execute_script]`)
    const release = await this[LOCK_TAG].acquire()
    try {
      await this.client.exec(script)
    } catch (e) {
      this.onError(e)
    } finally {
      release()
    }
  }
  
  // https://www.sqlite.org/lang_transaction.html
  // No reads or writes occur except within a transaction. Any command that accesses 
  // the database (basically, any SQL command, except a few PRAGMA statements) will 
  // automatically start a transaction if one is not already in effect. Automatically 
  // started transactions are committed when the last SQL statement finishes.

  async startTransaction(isolationLevel?: IsolationLevel): Promise<Transaction> {
    if (isolationLevel && isolationLevel !== 'SERIALIZABLE') {
      throw new DriverAdapterError({
        kind: 'InvalidIsolationLevel',
        level: isolationLevel,
      })
    }

    const options: TransactionOptions = {
      usePhantomQuery: true,
    }

    const tag = '[js::startTransaction]'
    debug('%s options: %O', tag, options)

    const release = await this[LOCK_TAG].acquire()

    try {
      this.client.exec("BEGIN DEFERRED")
      return new PrismaTransaction(this.client, options, release)
    } catch (e) {
      // note: we only release the lock if creating the transaction fails, it MUST stay locked otherwise,
      // hence `catch` and rethrowing the error and not `finally`.
      release()
      this.onError(e)
    }
  }

  dispose(): Promise<void> {
    this.client.close()
    return Promise.resolve()
  }
}

export class PrismaAdapterFactory implements SqlMigrationAwareDriverAdapterFactory {
  readonly provider = 'sqlite'
  readonly adapterName = packageName

  constructor(private readonly config: Config) { }

  connect(): Promise<SqlDriverAdapter> {
    return Promise.resolve(new PrismaAdapter(createClient2(this.config)))
  }

  connectToShadowDb(): Promise<SqlDriverAdapter> {
    const url = this.config.shadowDatabaseURL ?? ':memory:'
    return Promise.resolve(new PrismaAdapter(createClient2({ ...this.config, url: ':memory:' })))
  }

}

interface Config {
  url: ':memory:' | (string & {})
  shadowDatabaseURL?: ':memory:' | (string & {})
  fileMustExist?: boolean
  readOnly?: boolean
}
function createClient2(input: Config): StdClient {
  const { url, ...config } = input
  const dbPath = url.replace(/^file:/, '')
  const db = new Database(dbPath, config)
  return db
}
