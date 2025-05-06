import { existsSync, readFileSync } from 'node:fs';
import { Commander } from "./commander";
import { z } from "zod";
import { Router } from "./routes/router";
import { ok } from "node:assert";
import { createServer, IncomingMessage, Server, ServerResponse } from "node:http";
import { createSecureServer, Http2SecureServer, Http2ServerRequest, Http2ServerResponse } from "node:http2";

async function parseListeners(cli: string[]) {
  const listeners = [];
  let cur: any = undefined;

  for (let i = 0; i < cli.length; i++) {
    if (cli[i] === "--listen") {
      if (cur) listeners.push(cur);
      cur = {};
    } else if (cli[i]!.startsWith("--")) {
      throw `The arg "${cli[i]}" at ${i} starts with a double-dash. The listen command cannot be used with other commands. Commands start with a double dash (--listen).`
    } else {
      if (!cur) throw "found parameters before --listen";
      const div = cli[i]!.indexOf("=");
      if(div === -1) throw `The arg "${cli[i]}" at ${i} does not have an equals sign`
      const key = cli[i]!.slice(0, div);
      const val = cli[i]!.slice(div + 1);
      cur[key] = val;
    }
  }
  if (cur) listeners.push(cur);

  const listenerCheck = z.object({
    port: z.string().optional(),
    host: z.string().optional(),
    prefix: z.string().optional(),
    key: z.string().optional(),
    cert: z.string().optional(),
  }).array().safeParse(listeners);
  if (!listenerCheck.success) {
    console.log(listenerCheck.error);
    process.exit();
  }

  return listenerCheck.data;

}

export async function startListeners(cli: string[], commander: Commander) {
  const listeners = await parseListeners(cli);

  await commander.execute(["--render-tiddlywiki5"]);

  const router = await Router.makeRouter(
    commander,
    !!process.env.ENABLE_DEV_SERVER
  ).catch(e => {
    console.log(e.stack);
    throw "Router failed to load";
  });

  return listeners.map(e => {

    if (!e.key !== !e.cert) {
      throw new Error("Both key and cert are required for HTTPS");
    }

    return e.key && e.cert
      ? new ListenerHTTPS(router, e)
      : new ListenerHTTP(router, e);

  });
}

export class ListenerBase {
  constructor(
    public server: Http2SecureServer | Server,
    public router: Router,
    public bindInfo: string,
    options: { host?: string; port?: string; }
  ) {
    this.server.on("request", (
      req: IncomingMessage | Http2ServerRequest,
      res: ServerResponse | Http2ServerResponse
    ) => {
      this.handleRequest(req, res);
    });
    this.server.on('error', (error: NodeJS.ErrnoException) => {

      if (error.syscall !== 'listen') {
        throw error;
      }

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(bindInfo + ' requires elevated privileges');
          process.exit();
          break;
        case 'EADDRINUSE':
          console.error(bindInfo + ' is already in use');
          process.exit();
          break;
        default:
          throw error;
      }

    });
    this.server.on('listening', () => {
      const address = this.server.address();
      console.log(`Listening on`, address);
    });
    const { host, port = "" } = options;
    if (port === "0") {
      this.server.listen();
    } else if (+port) {
      const nport = +port;
      if (host)
        this.server.listen(nport, host);
      else
        this.server.listen(nport);
    } else {
      this.server.listen(8080);
    }
  }

  handleRequest(
    req: IncomingMessage | Http2ServerRequest,
    res: ServerResponse | Http2ServerResponse
  ) {
    this.router.handleIncomingRequest(req, res);
  }
}

interface Listener {
  port?: string | undefined;
  host?: string | undefined;
  prefix?: string | undefined;
  key?: string | undefined;
  cert?: string | undefined;
}

export class ListenerHTTPS extends ListenerBase {
  constructor(router: Router, config: Listener) {
    const { port = process.env.PORT, host } = config;
    const bindInfo = host ? `HTTPS ${host} ${port}` : `HTTPS ${port}`;
    ok(config.key && existsSync(config.key), "Key file not found at " + config.key);
    ok(config.cert && existsSync(config.cert), "Cert file not found at " + config.cert);
    const key = readFileSync(config.key);
    const cert = readFileSync(config.cert);
    super(createSecureServer({ key, cert, allowHTTP1: true, }), router, bindInfo, { host, port });

  }

}

export class ListenerHTTP extends ListenerBase {
  /** Create an http1 server */
  constructor(router: Router, config: Listener) {
    const { port, host } = config;
    const bindInfo = host ? `HTTP ${host} ${port}` : `HTTP ${port}`;
    super(createServer(), router, bindInfo, { host, port });
  }
}


