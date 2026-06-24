
import { Router, startListening, Z2, zod, truthy, createRootRoute } from "@tiddlywiki/server";
import { BaseCommand, CommandInfo } from "@tiddlywiki/commander";
import { serverEvents } from "@tiddlywiki/events";

serverEvents.on("cli.register", (commands) => {
  commands.listen = { info, Command };
});

export const info: CommandInfo = {
  name: "listen",
  description: "Listen for web requests. ",
  arguments: [],
  options: [
    // ["allow-hosts <host...>", "Allowed host headers. This does not change CORS behavior. "],
    // some notes about subdomains (not implemented yet)
    // - the dollar sign of $cache and $api is removed.
    // - domain name may have any number of levels
    // - attempting to host multiple domains will be confusing to users
    // - individual wikis cannot be set to subdomains, although there is a security use case for this.
    // - separate session cookies will be set for admin and wiki subdomains
    // - the login subdomain may become an oauth provider for the others
    // ["subdomains", "Change root paths to subdomains, (so domain.com/wiki/ becomes wiki.domain.com). "
    //   + "Listener prefix is ignored. Use allow-hosts to set valid hostnames (domain.com)"
    // ],
    // ["require-https", "The server will do everything it can to redirect HTTP to HTTPS. "
    //   + "Setting this without an HTTPS endpoint to redirect to can make the site unreachable. "
    //   + "The login form will refuse to login from http URLs and will attempt to redirect if possible. "
    //   + "If the x-forward-proto header is available, it will be used as well. "
    // ],
    ["listener [key=val...]", "Listen for web requests. Multiple listeners are allowed. "
      + "You may specify multiple --listener options, one for each listener you want to start in NodeJS. "
      + "All requests are funneled into one request stream. "
    ],
  ],
  getHelp() {
    return [
      "",
      "The listener options are: ",
      "    host=<string>          the host string, passed directly to NodeJS [default: localhost]",
      "",
      "    port=<number>          the port number                     [default: env.PORT or 8080]",
      "                           Use 0 to let Node find a random port. ",
      "",
      "    prefix=<string>        the URL pathname this listener is mounted at, ",
      "                           must begin with a slash ",
      "",
      "    key=<string>           HTTPS private key, relative to current directory ",
      "    cert=<string>          HTTPS public certificate, relative to current directory ",
      "",
      "    secure=<boolean>       Treat listener as HTTPS (useful in case the listener is behind",
      "                           a reverse proxy with SSL termination). Specifying this without",
      "                           HTTPS will definitely cause problems with login cookies.",
      "",
      // "    redirect=<number>      Redirect to an https URL at the specified port. Generally ",
      // "                           intended to redirect 80 to 443. Always specify the public port",
      // "                           not the listener port as the value here.",
      // "",
      "Examples: ",
      "    Listen on two reverse-proxy ports, redirecting the insecure one. ",
      "    $  mws listen \\",
      "       --listener port=8443 secure=true \\",
      "       --listener port=8080 redirect=443",
      "",
      "    Listen on a single reverse-proxy port, but attempt to detect insecure requests.",
      "    $  mws listen \\",
      "       --require-https \\",
      "       --listener port=8443 secure=true \\",

    ].join("\n");

  }
};

export const AllowedMethods = [...["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"] as const];
export type AllowedMethod = (typeof AllowedMethods)[number];


export type ListenerRaw = {
  [key in
  | "port"
  | "host"
  | "prefix"
  | "key"
  | "cert"
  | "secure"
  | "redirect"
  ]?: string | undefined
};

declare module "@tiddlywiki/events" {
  interface ServerEventsMap {
    "listen.router.init": [command: Command, router: Router];
  }
}

export class Command extends BaseCommand<[], {
  listener: ListenerRaw[];
  allow_hosts: string[];
  subdomains: boolean;
  require_https: boolean;
}> {
  async execute() {
    const listenOptions = this.options.listener || [];

    const listenerCheck = zod.object({
      port: zod.string().optional(),
      host: zod.string().optional(),
      prefix: zod.string().optional()
        .transform(prefix => prefix || "")
        .refine((prefix) => !prefix || prefix.startsWith("/"),
          "Listener path prefix must start with a slash or be falsy")
        .refine((prefix) => !prefix.endsWith("/"),
          "Listener path prefix must NOT end with a slash"),
      key: zod.string().optional(),
      cert: zod.string().optional(),
      secure: zod.enum(["true", "false", "yes", "no"]).optional()
        .transform(e => e === "true" || e === "yes"),
      redirect: zod.string().transform((v) => +v).refine(truthy).optional(),
    }).strict().array().safeParse(listenOptions);

    if (!listenerCheck.success) {
      console.log("Invalid listener options: ");
      console.log(listenOptions);
      console.log(Z2.prettifyError(listenerCheck.error).toString());
      process.exit();
    }

    const rootRoute = createRootRoute([], async (state) => { })
    const router = new Router(rootRoute);
    // listeners on here setup all the request handling
    await serverEvents.emitAsync("listen.router.init", this, router);
    // tell the server to start listeners for this router
    await startListening((r, e) => router.fetch(r, e), listenerCheck.data);

  }
}