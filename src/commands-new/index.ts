import * as mwsloadpluginbags from "./mws-load-plugin-bags";
import * as mwsrendertiddler from "./mws-render-tiddler";
import * as mwsloadwikifolder from "./mws-load-wiki-folder";


export default function commands() {
  return {
    [mwsloadpluginbags.info.name]: mwsloadpluginbags,
    [mwsrendertiddler.info.name]: mwsrendertiddler,
    [mwsloadwikifolder.info.name]: mwsloadwikifolder,
  }
}