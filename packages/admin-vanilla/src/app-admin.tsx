import { customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import { AppShell, EditPage, FeedbackNotice, } from "./app-shell";
import type { EditPageModel, RenderContent } from "./app-shell";
import { AppTabController } from "./app-tab-controller";
import { EditPageRenders, getEditPageRenders } from "./app-edit-pages.tsx";
import { IdString, PageId, SendError } from "@/server";
import { tryParseJSON } from "@/server";
import { text } from "stream/consumers";

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
  @state() accessor editRenders: EditPageRenders | null = null;
  @state() accessor selectedRecord: { tabId: PageId; saved: any } | null = null;
  @state() accessor data: any = null;
  @state() accessor isLoadingData = false;
  @state() accessor loadError: Error | null = null;



  tabController = new AppTabController(this);

  private readonly closeEditor = () => {
    if (this.editPage?.saving) return;
    this.editPage = null;
    this.editRenders = null;
    this.selectedRecord = null;
  };

  connectedCallback() {
    super.connectedCallback();
    if (this.data === null) void this.getStoreData();
  }

  renderFeedback = () => this.loadError ? <FeedbackNotice
    onDismiss={this.renderFeedback_onDismiss}
    title="Unable to load admin records"
    tone="error"
  >
    <pre style="white-space: break-spaces;">
      {SendError.errorString(this.loadError)}
    </pre>
  </FeedbackNotice> : null;
  renderFeedback_onDismiss = () => { this.loadError = null; };


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
    this.editRenders = getEditPageRenders(tabId, this.data, saved);
    const form = this.editRenders.form;
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
              error: error instanceof Error ? error : new Error("Failed to save admin record."),
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
    };
    this.editPage = model;
  }
  getStoreData = async () => {
    if (this.isLoadingData) return;
    this.isLoadingData = true;
    this.loadError = null;
    await fetch(pathPrefix + embeddedServerResponse.rootRoutes.admin + "/load", {
      headers: { "X-Requested-With": "TiddlyWiki" }
    }).then(async response => {
      await new Promise(r => setTimeout(r, 1000));
      const text = await response.text();
      if (!response.ok) {
        this.loadError = this.handleErrorResponse(tryParseJSON(text) || text);
      } else {
        this.data = JSON.parse(text, jsonReviver);;
      }
    }).catch(e => {
      if (e instanceof Error) this.loadError = e;
      else this.loadError = new Error(`${e}`);
    });
    this.isLoadingData = false;
  };

  async saveStoreData(tabId: PageId, item: any): Promise<any> {
    if (!this.data) throw new Error("Admin records have not loaded.");
    if (tabId === "templates") item.twVersion ||= null;
    const url = pathPrefix + embeddedServerResponse.rootRoutes.admin + "/save/" + tabId;
    return await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "TiddlyWiki",
      },
      body: JSON.stringify(item),
    }).then(async response => {
      const text = await response.text();
      if (!response.ok) {
        throw this.handleErrorResponse(tryParseJSON(text) || text);
      } else {
        const updatedRecord = JSON.parse(text, jsonReviver);
        const records: any[] = this.data[tabId];
        const id = updatedRecord.id.toString();
        this.data = {
          ...this.data,
          [tabId]: records.some((record) => record.id.toString() === id)
            ? records.map((record) => record.id.toString() === id ? updatedRecord : record)
            : [...records, updatedRecord],
        };
      }
    });
  }

  handleErrorResponse(error: any) {
    if (!error) {
      return new Error(`Server error: Failed to save admin record.`)
    } else if (typeof error === "object" && error.status && error.reason) {
      return new SendError(error.reason, error.status, error.details);
    } else {
      return new Error(`Server error: ${error.message ?? error}`);
    }
  }

  protected render() {

    return <>
      <AppShell
        renderNavigation={this.tabController.renderTabs}
        renderFeedback={this.renderFeedback}
        renderContent={this.tabController.renderListContent}
      />
      <EditPage model={this.editPage} >
        {this.editRenders?.renderEditor && <display-content slot="editor">{this.editRenders.renderEditor() ?? null}</display-content>}
        {this.editRenders?.renderCurrent && <display-content slot="sidebar">{this.editRenders.renderCurrent() ?? null}</display-content>}
        {this.editRenders?.renderPreview && <display-content slot="preview">{this.editRenders.renderPreview() ?? null}</display-content>}
      </EditPage>
    </>;
  }
}