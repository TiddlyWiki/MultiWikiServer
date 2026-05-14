import { existsSync, readFileSync } from 'node:fs';
import { ok } from "node:assert";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { createSecureServer, Http2ServerRequest, Http2ServerResponse, Http2Session, SecureServerOptions } from "node:http2";
import { HonoEnv, RouterFetch } from "./router";
import { serverEvents } from '@tiddlywiki/events';
import { ServerType as HonoNodeServer, createAdaptorServer } from '@hono/node-server';
import { Hono } from 'hono';

export class NodeListenerBase {
  onServerExit = async () => {
    await new Promise<any>((resolve) => {
      this.server.close(resolve);
    });
  };
  constructor(
    public server: HonoNodeServer,
    public bindInfo: string,
    public options: ListenOptions,
  ) {
    serverEvents.on("exit", this.onServerExit);
    this.server.on('listening', () => {
      const address = this.server.address();
      console.log(`Listening on`, address, options.prefix);
    });
    const { host, port } = options;
    if (port === "0") {
      this.server.listen(undefined, host);
    } else if (port && +port) {
      this.server.listen(+port, host);
    } else {
      this.server.listen(8080, host);
    }

  }
}

export class NodeListenerHTTPS extends NodeListenerBase {
  constructor(appfetch: RouterFetch, config: ListenOptions) {
    const { port, host, prefix } = config;
    const bindInfo = `HTTPS ${host} ${port} ${prefix}`;
    const serverOptions = config.secureServerOptions ?? (() => {
      ok(config.key && existsSync(config.key), "Key file not found at " + config.key);
      ok(config.cert && existsSync(config.cert), "Cert file not found at " + config.cert);
      const key = readFileSync(config.key), cert = readFileSync(config.cert);
      return { key, cert, allowHTTP1: true, };
    })();
    const server = createAdaptorServer({
      fetch: (req, env) => appfetch(req, { ...env, pathPrefix: prefix, presumeHTTPS: true, bindInfo, }),
      createServer: createSecureServer,
      overrideGlobalObjects: false,
      serverOptions,
    });
    super(server, bindInfo, config);
    this.server.on("session", (session: Http2Session) => {
      const closeSession = () => { console.log("close session"); session.close(); }
      serverEvents.on("exit", closeSession);
      session.on("close", () => { serverEvents.off("exit", closeSession); })
    });
  }

}

export class NodeListenerHTTP extends NodeListenerBase {
  /** Create an http1 server */
  constructor(appfetch: RouterFetch, config: ListenOptions) {
    const { port, host, prefix, secure } = config;
    const bindInfo = `HTTP ${host} ${port} ${prefix}`;
    super(createAdaptorServer({
      fetch: (req, env) => appfetch(req, { ...env, pathPrefix: prefix, presumeHTTPS: !!secure, bindInfo, }),
      createServer: createServer,
      overrideGlobalObjects: false,
    }), bindInfo, config);
  }
}

export interface ListenOptions {
  port: string;
  host: string;
  prefix: string;
  secure: boolean;
  /** If this is set, key and cert will be ignored */
  secureServerOptions?: SecureServerOptions<typeof IncomingMessage, typeof ServerResponse, typeof Http2ServerRequest, typeof Http2ServerResponse>
  key?: string;
  cert?: string;
  redirect?: number;
}


