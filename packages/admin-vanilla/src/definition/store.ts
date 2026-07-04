import {
  AdminStorage,
  AdminRecord,
  isServerField,
  getAdminRecordValue,
  setAdminRecordValue,
  uniqueLines,
} from "../app";
import { lineListCodec } from "./renders";
import {
  DataStore,
  AdminRecordStore,
  TabId,
  getTab,
  TabDefinition,
  TemplateAdminRecord,
  WikiAdminRecord,
  BagAdminRecord,
  PermissionRow,
  PluginAdminRecord,
  WritablePrefixRow,
  KeyString,
  IdString,
  fieldTypeCreateFactories,
} from "./tabs";

import { mapGetInit } from "./utils";

export const jsonReviver = (key: any, val: any) => {
  if (typeof val === "string" && val.startsWith(IdString.prefix))
    return new IdString(val.slice(IdString.prefix.length));
  if (typeof val === "string" && val.startsWith(KeyString.prefix))
    return new KeyString(val.slice(KeyString.prefix.length));
  return val;
};

export class InMemoryAdminStorage implements AdminStorage {
  private data!: DataStore;
  constructor(
    private deriveItems: (data: DataStore) => AdminRecordStore
  ) {
  }

  public async loadAll(): Promise<AdminRecordStore> {
    const data = await (await fetch(pathPrefix + "/admin/load", {
      headers: {
        "X-Requested-With": "TiddlyWiki"
      }
    })).text();

    this.data = JSON.parse(data, jsonReviver);
    return this.deriveItems(this.data);
  }
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      globalThis.setTimeout(resolve, ms);
    });
  }

  public async read<T extends TabId>(tabId: T, id: IdString): Promise<AdminRecordStore[T][number] | null> {
    if (!this.data) await this.loadAll();
    return this.deriveItems(this.data)[tabId].find((record) => record.id?.toString() === id?.toString()) ?? null;
  }

  public async save<T extends TabId>(tabId: T, record: AdminRecordStore[T][number]): Promise<AdminRecordStore[T]> {
    if (!this.data) throw new Error("data should be loaded first");
    console.log(record);
    const prunedRecord = this.pruneStoredRecord(tabId, record);
    const id = prunedRecord.id;
    const response = await fetch(pathPrefix + "/admin/save/" + tabId, {
      method: "PUT",
      body: JSON.stringify(prunedRecord),
      headers: {
        "X-Requested-With": "TiddlyWiki"
      }
    });

    const text = await response.text();

    if (response.status !== 200) {
      throw new Error(text);
    } else {
      const storedRecord = JSON.parse(text, jsonReviver);
      console.log(storedRecord, prunedRecord);
      if (id?.toString()) {
        if (storedRecord.id?.toString() !== id.toString()) location.reload();
        const index = this.data[tabId].findIndex((item) => item.id?.toString() === id.toString());
        if (index >= 0) {
          this.data[tabId][index] = storedRecord as any;
        } else {
          this.data[tabId].push(storedRecord as any);
        }
      } else {
        this.data[tabId].push(storedRecord as any);
      }
    }

    this.data = { ...this.data, [tabId]: [...this.data[tabId]] };
    return this.deriveItems(this.data)[tabId].map((item) => ({ ...item })) as AdminRecordStore[T];
  }

  private pruneStoredRecord(tabId: TabId, record: AdminRecord): AdminRecord {
    const tab = getTab(tabId);
    const storedFields = tab.fields.filter((field) => isServerField(field.mode));
    const pruned: any = { id: record.id };
    for (const field of storedFields) {
      const value = getAdminRecordValue(field, record);
      setAdminRecordValue(field, pruned, value, true);
    }
    return pruned;
  }
}



export function createDraft(tab: TabDefinition, source?: AdminRecord): AdminRecord {
  const draft: any = { id: source?.id ?? "" };
  for (const field of tab.fields) {
    const value = source
      ? getAdminRecordValue(field, source)
      : fieldTypeCreateFactories[field.type]();
    setAdminRecordValue(field, draft, value, true);
  }

  if (!source && tab.id === "templates") {
    const draft2: TemplateAdminRecord = draft as any;
    draft2.requiredPluginsEnabled = true;
    draft2.customHtmlEnabled = false;
    draft2.injectionArray = "$tw.preloadTiddlers";
  }

  // console.log(buildTabZodObject(tab.id).safeParse(draft), KeyString.name, IdString.name);

  return draft;
}

export function findTemplateRecordForWikiRecord(draft: DataStore["wikis"][number], itemsByTab: DataStore) {
  return itemsByTab.templates.find((template) => draft.templateName === template.name);
}


function summarizePermissionRoles(value: readonly PermissionRow<string>[]): string {
  return value.map((row) => row.role).filter(Boolean).join(", ");
}


function deriveBagRecords(items: DataStore, templates: TemplateAdminRecord[], wikis: WikiAdminRecord[]): BagAdminRecord[] {
  const templateReadonlyUsage = new Map<string, Set<string>>();
  const wikiReadonlyUsage = new Map<string, Set<string>>();
  const wikiWritableUsage = new Map<string, Set<string>>();
  const wikiDefaultUsage = new Map<string, Set<string>>();

  const addUsage = (map: Map<string, Set<string>>, bagName: KeyString, recordName: KeyString) => {
    if (!bagName || !recordName) return;
    mapGetInit(map, bagName.toString(), () => new Set).add(recordName.toString());
  };

  for (const template of templates) {
    const templateName = template.name ?? "";
    template.readonlyBags.forEach((bagName) => addUsage(templateReadonlyUsage, bagName, templateName));
  }

  for (const wiki of wikis) {
    const wikiName = wiki.slug || wiki.displayName || "";
    const templateRecord = findTemplateRecordForWikiRecord(wiki, { ...items, templates, wikis });
    const effectiveReadonlyBags = uniqueLines([
      ...wiki.readonlyBags ?? [],
      ...templateRecord?.readonlyBags ?? [],
    ].map(e => e.toString()));
    effectiveReadonlyBags.forEach((bagName) => addUsage(wikiReadonlyUsage, new KeyString(bagName), wikiName));

    const prefixRows = wiki.writablePrefixBags;
    prefixRows.forEach((row) => addUsage(wikiWritableUsage, row.bagName, wikiName));
    const defaultBag = prefixRows.find((row) => row.prefix === "")?.bagName ?? new KeyString("");
    addUsage(wikiDefaultUsage, defaultBag, wikiName);
  }

  return items.bags.map((bag) => {
    const name = bag.name ?? "";
    const referencedByTemplates = Array.from(templateReadonlyUsage.get(name.toString()) ?? []);
    const referencedByWikis = Array.from(wikiReadonlyUsage.get(name.toString()) ?? new Set<string>());
    const writableByWikis = Array.from(wikiWritableUsage.get(name.toString()) ?? new Set<string>());
    const defaultByWikis = Array.from(wikiDefaultUsage.get(name.toString()) ?? new Set<string>());
    const routingRoles = uniqueLines([
      referencedByWikis.length ? "readonly layer" : "",
      writableByWikis.length ? "writable prefix target" : "",
      defaultByWikis.length ? "default writable target" : "",
    ]);
    const allUsingWikis = new Set<string>([
      ...referencedByWikis,
      ...writableByWikis,
      ...defaultByWikis,
    ]);

    return {
      ...bag,
      usedByCount: String(allUsingWikis.size),
      readonlyUsageCount: String(referencedByWikis.length),
      writableUsageCount: String(writableByWikis.length),
      defaultUsageCount: String(defaultByWikis.length),
      permissionSummary: summarizePermissionRoles(bag.permissions),
      referencedByTemplates: referencedByTemplates.join("\n"),
      referencedByWikis: Array.from(allUsingWikis).join("\n"),
      routingRoles: routingRoles.join("\n"),
    };
  });
}

function derivePluginRecords(items: DataStore, templates: TemplateAdminRecord[], wikis: WikiAdminRecord[]): PluginAdminRecord[] {
  const pluginUsage = new Map<string, Set<string>>();

  for (const wiki of wikis) {
    const wikiName = wiki.slug || wiki.displayName || "";
    wiki.effectivePluginSet.forEach((pluginValue) => {
      const pluginName = pluginValue.split("@")[0]?.trim() ?? pluginValue.trim();
      if (!pluginName || !wikiName) return;
      mapGetInit(pluginUsage, pluginName, () => new Set()).add(wikiName.toString());
    });
  }

  return items.plugins.map((plugin) => {
    const usedByWikis = Array.from(pluginUsage.get(plugin.name.toString() ?? "") ?? []).map(e => new KeyString(e));
    return {
      ...plugin as unknown as PluginAdminRecord,
      usedByWikis,
      usageCount: String(usedByWikis.length),
    };
  });
}

function buildEffectiveBagStack({
  writablePrefixBags: prefixRows,
  templateReadonlyBags,
  wikiReadonlyBags,
}: {
  writablePrefixBags: readonly WritablePrefixRow[];
  templateReadonlyBags: readonly KeyString[];
  wikiReadonlyBags: readonly KeyString[];
}): string[] {
  const defaultTargets = prefixRows.filter((row) => row.prefix === "").map((row) => row.bagName);
  const prefixedTargets = prefixRows.filter((row) => row.prefix !== "").map((row) => row.bagName);
  return uniqueLines([
    ...defaultTargets.map(e => e.toString()),
    ...prefixedTargets.map(e => e.toString()),
    ...wikiReadonlyBags.map(e => e.toString()),
    ...templateReadonlyBags.map(e => e.toString()),
  ]) as string[];
}

function buildEffectivePluginSet({
  previousEffectivePlugins,
  templatePlugins,
  wikiPlugins,
  corePluginsEnabled,
}: {
  previousEffectivePlugins: readonly string[];
  templatePlugins: readonly string[];
  wikiPlugins: readonly string[];
  corePluginsEnabled: boolean;
}): string[] {
  const authoredPlugins = uniqueLines([...templatePlugins, ...wikiPlugins]);
  const runtimeManagedPlugins = previousEffectivePlugins.filter((plugin) => !authoredPlugins.includes(plugin));
  const corePlugins = corePluginsEnabled
    ? runtimeManagedPlugins.filter((plugin) => /core/i.test(plugin))
    : [];
  const requiredPlugins = runtimeManagedPlugins.filter((plugin) => !corePlugins.includes(plugin));

  return uniqueLines([
    ...wikiPlugins,
    ...templatePlugins,
    ...requiredPlugins,
    ...corePlugins,
  ]);
}


function syncWikiRecord(draft: DataStore["wikis"][number], data: DataStore) {
  const templateRecord = findTemplateRecordForWikiRecord(draft, data);
  const templateReadonlyBags = templateRecord ? templateRecord.readonlyBags : [];
  const templatePlugins = templateRecord ? templateRecord.plugins : [];
  const wikiReadonlyBags = draft.readonlyBags;
  const wikiPlugins = draft.plugins;

  const mergedReadonlyBags = uniqueLines([...wikiReadonlyBags, ...templateReadonlyBags].map(e => e.toString()));
  const mergedPlugins = buildEffectivePluginSet({
    previousEffectivePlugins: (draft as WikiAdminRecord).effectivePluginSet,
    templatePlugins,
    wikiPlugins,
    corePluginsEnabled: !!templateRecord?.requiredPluginsEnabled,
  });
  const writablePrefixBags = draft.writablePrefixBags

  const defaultWritableBag = writablePrefixBags.find((row) => row.prefix === "")?.bagName ?? new KeyString("");
  const prefixRuleCount = String(writablePrefixBags.length);
  const readableBagOrder = buildEffectiveBagStack({
    writablePrefixBags,
    templateReadonlyBags,
    wikiReadonlyBags,
  });
  const missingBags = readableBagOrder.filter((bagName) => !data.availableBagNames.has(bagName));
  const missingPlugins = mergedPlugins.filter((pluginName) => !data.availablePluginNames.has(pluginName));
  const hasMissingDependencies = missingBags.length > 0 || missingPlugins.length > 0;
  const missingMessages = [
    missingBags.length ? `Missing bags: ${missingBags.join(", ")}` : "",
    missingPlugins.length ? `Missing plugins: ${missingPlugins.join(", ")}` : "",
  ].filter(Boolean);
  const compileValidation = hasMissingDependencies
    ? `Alert. ${missingMessages.join(". ")}.`
    : "Valid. All referenced bags and plugins are present.";
  const statusFlags = hasMissingDependencies ? "alert, missing dependencies" : "compiled, dependencies resolved";

  return {
    ...draft,
    templateName: new KeyString(templateRecord?.name.toString() ?? draft.templateName?.toString() ?? ""),
    defaultWritableBag,
    readonlyBagCount: String(mergedReadonlyBags.length),
    prefixRuleCount,
    pluginCount: String(mergedPlugins.length),
    compileValidation,
    statusFlags,
    missingBags: lineListCodec.stringify(missingBags),
    missingPlugins: lineListCodec.stringify(missingPlugins),
    titleResolutionPreview: "",
  } satisfies WikiAdminRecord;
}

function deriveItems(items: DataStore): AdminRecordStore {
  items.availableBagNames = new Set(items.bags.map((bag) => bag.name.toString()).filter(Boolean));
  items.availablePluginNames = new Set(items.plugins.map((plugin) => plugin.name.toString()).filter(Boolean));
  const wikis = items.wikis.map((wiki) => syncWikiRecord(wiki, items));
  const dependentWikiMap = new Map<KeyString, KeyString[]>();
  for (const wiki of wikis) {
    mapGetInit(dependentWikiMap, wiki.templateName, () => []).push(wiki.slug);
  }

  const templates = items.templates.map((template) => {
    const dependentWikis = dependentWikiMap.get(template.name) ?? [];
    const readonlyBags = template.readonlyBags
    const prefixRows = template.writablePrefixBags
    return {
      ...template,
      readonlyBagsSummary: readonlyBags.join(", "),
      dependentWikis: dependentWikis.join("\n"),
      dependentWikiCount: String(dependentWikis.length),
      defaultWritableBag: prefixRows.find((row) => row.prefix === "")?.bagName ?? new KeyString(""),
      validationReport: "placeholder",
      validationStatus: "placeholder",
      lastUpdatedAt: new Date().toISOString(),
    } satisfies TemplateAdminRecord;
    // lastUpdatedAt, validationStatus, validationReport
  });

  const users = items.users.map(e => ({
    ...e,
    confirmPassword: "",
  }))

  return {
    ...items,
    templates,
    wikis,
    users,
    bags: deriveBagRecords(items, templates, wikis),
    plugins: derivePluginRecords(items, templates, wikis),
  } as unknown as AdminRecordStore;
}

export function getEmptyItems(): AdminRecordStore {
  return {
    availableBagNames: new Set(),
    availablePluginNames: new Set(),
    wikis: [],
    templates: [],
    bags: [],
    plugins: [],
    roles: [],
    users: [],
  };
}


export const adminStorage: AdminStorage = new InMemoryAdminStorage(deriveItems);

