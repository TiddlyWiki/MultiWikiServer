import { IdString } from "@mws/admin-vanilla/src/definition/tabs";
import { serverEvents } from "@tiddlywiki/events";
import { TiddlerEventType } from "@tiddlywiki/mws-prisma";




declare module "@tiddlywiki/events" {
  interface ServerEventsMap {
    "mws.tiddler.events": [{
      recipe_id?: string;
      bag_id: string;
      title: string;
      revision: string;
      deletion: boolean;
    }];
  }
}



export class WikiStore {
  constructor(private tx: PrismaTxnClient) { }
  async saveTiddler(options: {
    /** Only used for the mws.tiddler.events log. */
    recipe_id?: IdString;
    bag_id: IdString;
    fields: any;
  }) {
    // { recipe_id, bag_id, fields }
    const recipe_id = options.recipe_id as string | undefined;
    const bag_id = options.bag_id as string;
    const fields = options.fields;
    const title = fields.title;
    if (!title) {
      throw new Error("Tiddler must have a title");
    }

    const event = await this.tx.tiddlerEvent.create({
      data: { bag_id, title, type: "save" }
    });

    const revision = BigInt(event.seq);

    const tiddler = await this.tx.tiddler.upsert({
      where: { bag_id_title: { bag_id, title } },
      update: { fields, revision },
      create: { bag_id, title, fields, revision },
    });

    serverEvents.emitLog("mws.tiddler.events", {
      recipe_id,
      bag_id,
      deletion: false,
      revision: `${event.seq}`,
      title,
    });

    return tiddler;

  }


  async deleteTiddler(options: {
    /** Only used for the mws.tiddler.events log. */
    recipe_id?: IdString;
    bag_id: IdString;
    title: string;
  }) {
    const recipe_id = options.recipe_id as string | undefined;
    const bag_id = options.bag_id as string;
    const title = options.title as string;
    const deleted = await this.tx.tiddler.deleteMany({
      where: { bag_id, title }
    });
    if (!deleted.count) return null;
    const event = await this.tx.tiddlerEvent.create({
      data: { bag_id, title, type: "delete" }
    });
    serverEvents.emitLog("mws.tiddler.events", {
      recipe_id,
      bag_id,
      deletion: true,
      revision: `${event.seq}`,
      title,
    });
    return event;
  }
}