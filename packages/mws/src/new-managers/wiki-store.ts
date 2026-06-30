import { serverEvents } from "@tiddlywiki/events";




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
  async saveTiddler({ recipe_id, bag_id, fields }: {
    /** Only used for the mws.tiddler.events log. */
    recipe_id?: string;
    bag_id: string;
    fields: any;
  }) {
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

  async deleteTiddler({ recipe_id, bag_id, title }: {
    /** Only used for the mws.tiddler.events log. */
    recipe_id?: string;
    bag_id: string;
    title: string;
  }) {
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