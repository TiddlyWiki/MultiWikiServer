



declare module "@tiddlywiki/events" {
  interface ServerEventsMap {
    "mws.tiddler.events": [{
      recipe_id?: string;
      bag_id: string;
      title: string;
      revision_id: string;
      is_deleted: boolean;
    }];
  }
}



export class WikiStore {
  private tx!: PrismaTxnClient;
  async saveTiddler({ bag_id, tiddler }: {
    bag_id: string;
    tiddler: any;
  }) {
    const title = tiddler.title;
    if (!title) {
      throw new Error("Tiddler must have a title");
    }

    const fields = Object.fromEntries(
      Object.entries(tiddler)
        .filter(([, value]) => value !== undefined)
        .map(([fieldName, fieldValue]) => [fieldName, typeof fieldValue === "string" ? fieldValue : `${fieldValue}`])
    );
    const event = await this.tx.tiddlerEvent.create({
      data: { bag_id, title, type: "save" }
    });

    await this.tx.tiddler.upsert({
      where: { bag_id_title: { bag_id, title } },
      update: { fields, revision: event.seq },
      create: { bag_id, title, fields, revision: event.seq },
    });

  }
}