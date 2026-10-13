import { customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import { AppShell, EditPage, FeedbackNotice, } from "./app-shell";
import type { EditPageModel, RenderContent } from "./app-shell";
import { AppTabController } from "./app-tab-controller";
import { getEditPageRenders } from "./app-edit-pages.tsx";
import { IdString, PageId } from "@/server";

const jsonReviver = (key: any, val: any) => {
  if (typeof val === "string" && val.startsWith(IdString.prefix))
    return new IdString(val.slice(IdString.prefix.length));
  return val;
};

export interface AdminTab {
  id: PageId;
  label: string;
  ariaLabel: string;
  createLabel: string;
  eyebrow: string;
  description: string;
  dividerBefore?: boolean;
  renderListContent: RenderContent;
}

@customElement("mws-app-admin")
export class AppAdmin extends JSXElement {
  useLightDOM = true;
  @state() accessor props: Record<string, never> = {};

  @state() accessor editPage: EditPageModel | null = null;
  @state() accessor selectedRecord: { tabId: PageId; saved: any } | null = null;
  @state() accessor data: any = null;
  @state() accessor isLoadingData = false;
  @state() accessor loadError = "";



  tabController = new AppTabController(this);

  private readonly closeEditor = () => {
    if (this.editPage?.saving) return;
    this.editPage = null;
    this.selectedRecord = null;
  };

  connectedCallback() {
    super.connectedCallback();
    if (this.data === null) void this.getStoreData();
  }

  renderFeedback = () => this.loadError
    ? <FeedbackNotice
      title="Unable to load admin records"
      tone="error"
      renderContent={() => <pre style="white-space: break-spaces;">{this.loadError}</pre>}
      onDismiss={() => { this.loadError = ""; }}
    />
    : null;
  // <FeedbackNotice title="Loading admin records..." tone="info" />

  openCreate(tabId: PageId, title: string, eyebrow: string, description: string) {
    if (this.editPage?.saving) return;
    this.selectedRecord = null;
    this.openEditor(tabId, title, eyebrow, description, "create");
  }

  openEdit(tabId: PageId, saved: any, title: string, eyebrow: string, description: string) {
    if (this.editPage?.saving) return;
    this.selectedRecord = { tabId, saved };
    this.openEditor(tabId, `Edit ${title}`, eyebrow, description, "edit", saved);
  }

  private openEditor(tabId: PageId, title: string, eyebrow: string, description: string, mode: "create" | "edit", saved?: any) {
    const { form, ...renders } = getEditPageRenders(tabId, this.data, saved);
    const model: EditPageModel = {
      title,
      eyebrow,
      description,
      mode,
      saveLabel: "Save",
      onClose: this.closeEditor,
      onSave: async () => {
        if (!this.editPage || this.editPage.saving || this.editPage.onSave !== model.onSave) return;
        this.editPage = { ...this.editPage, saving: true, error: undefined };
        form.disable();
        try {
          await this.saveStoreData(tabId, form.value);
          if (this.editPage && this.editPage.onSave === model.onSave) {
            this.editPage = { ...this.editPage, saving: false };
            this.closeEditor();
          }
        } catch (error) {
          if (this.editPage && this.editPage.onSave === model.onSave) {
            this.editPage = {
              ...this.editPage,
              error: error instanceof Error ? error.message : "Failed to save admin record.",
            };
          }
        } finally {
          form.enable();
          if (this.editPage && this.editPage.onSave === model.onSave) {
            this.editPage = { ...this.editPage, saving: false };
          }
        }
      },
      onDismissError: () => {
        if (this.editPage && this.editPage.onSave === model.onSave) {
          this.editPage = { ...this.editPage, error: undefined };
        }
      },
      ...renders,
    };
    this.editPage = model;
  }
  getStoreData = async () => {
    if (this.isLoadingData) return;
    this.isLoadingData = true;
    this.loadError = "";



    try {
      const response = await fetch(pathPrefix + embeddedServerResponse.rootRoutes.admin + "/load", {
        headers: { "X-Requested-With": "TiddlyWiki" }
      });
      await new Promise(r => setTimeout(r, 1000));
      const text = await response.text();
      if (!response.ok) throw new Error(text || `Failed to load admin records (${response.status}).`);
      this.data = JSON.parse(text, jsonReviver);
    } catch (error) {
      this.loadError = error instanceof Error ? error.message : "Failed to load admin records.";
    } finally {
      this.isLoadingData = false;
    }
  };

  async saveStoreData(tabId: PageId, item: any): Promise<any> {
    if (!this.data) throw new Error("Admin records have not loaded.");
    if (tabId === "templates") item.twVersion ||= null;
    const url = pathPrefix + embeddedServerResponse.rootRoutes.admin + "/save/" + tabId;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "TiddlyWiki",
      },
      body: JSON.stringify(item),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || `Failed to save admin record (${response.status}).`);
    const updatedRecord = JSON.parse(text, jsonReviver);
    const records: any[] = this.data[tabId];
    const id = updatedRecord.id.toString();
    this.data = {
      ...this.data,
      [tabId]: records.some((record) => record.id.toString() === id)
        ? records.map((record) => record.id.toString() === id ? updatedRecord : record)
        : [...records, updatedRecord],
    };
    return updatedRecord;
  }



  protected render() {

    return <>
      <AppShell
        renderNavigation={this.tabController.renderTabs}
        renderFeedback={this.renderFeedback}
        renderContent={this.tabController.renderListContent}
      />
      <EditPage model={this.editPage} />
    </>;
  }
}