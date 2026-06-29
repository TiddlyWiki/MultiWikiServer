import { AdminStorage, AdminRecord, isServerField, getAdminRecordValue, setAdminRecordValue } from "../app";
import { DataStore, AdminRecordStore, TabId, getTab } from "./tabs";

export class InMemoryAdminStorage implements AdminStorage {
  private data!: DataStore;
  constructor(
    private deriveItems: (data: DataStore) => AdminRecordStore
  ) {
  }

  public async loadAll(): Promise<AdminRecordStore> {
    this.data = await (await fetch(pathPrefix + "/admin/load")).json();
    return this.deriveItems(this.data);
  }
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      globalThis.setTimeout(resolve, ms);
    });
  }

  public async read(tabId: TabId, id: string): Promise<AdminRecord | null> {
    if (!this.data) await this.loadAll();
    return this.deriveItems(this.data)[tabId].find((record) => record.id === id) ?? null;
  }

  public async save(tabId: TabId, record: AdminRecord): Promise<AdminRecord[]> {
    if (!this.data) throw new Error("data should be loaded first");

    const currentTabRecords = this.data[tabId];
    const prunedRecord = this.pruneStoredRecord(tabId, record, currentTabRecords.length);
    const id = prunedRecord.id;
    const response = await fetch(pathPrefix + "/admin/save", {
      body: JSON.stringify(prunedRecord),
    });

    if (response.status !== 200) {
      console.log(await response.text());
    } else {
      const storedRecord = await response.json();
      if (id) {
        if (storedRecord.id !== id) location.reload();
        const index = this.data[tabId].findIndex(e => e.id === id);
        this.data[tabId][index] = storedRecord as any;
      } else {
        this.data[tabId].push(storedRecord as any);
      }
    }

    this.data = { ...this.data, [tabId]: [...this.data[tabId]] };
    return this.deriveItems(this.data)[tabId].map((item) => ({ ...item }));
  }

  private pruneStoredRecord(tabId: TabId, record: AdminRecord, fallbackOrdinal?: number): AdminRecord {
    const tab = getTab(tabId);
    const storedFields = tab.fields.filter((field) => isServerField(field.mode));
    const pruned: any = {};
    for (const field of storedFields) {
      const value = getAdminRecordValue(field, record);
      setAdminRecordValue(field, pruned, value, true);
    }
    return pruned;
  }
}
