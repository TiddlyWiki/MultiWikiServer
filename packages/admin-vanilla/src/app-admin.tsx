import { customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import { AppShell, EditPage, FeedbackNotice, } from "./app-shell";
import type { EditPageModel, RenderContent } from "./app-shell";
import { AppTabController } from "./app-tab-controller";
import { getEditPageRenders } from "./app-edit-pages.tsx";
import { AdminClient, DataSave, DataStore, IdString, PageId } from "@/server";


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
  @state() accessor selectedRecord: { tabId: PageId; saved: DataStore[PageId][number] } | null = null;
  @state() accessor data: any = null;
  @state() accessor isLoadingData = false;
  @state() accessor loadError = "";



  tabController = new AppTabController(this);

  private readonly closeEditor = () => {
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
    this.selectedRecord = null;
    this.openEditor(tabId, title, eyebrow, description, "create");
  }

  openEdit(tabId: PageId, saved: DataStore[PageId][number], title: string, eyebrow: string, description: string) {
    this.selectedRecord = { tabId, saved };
    this.openEditor(tabId, `Edit ${title}`, eyebrow, description, "edit", saved);
  }

  private openEditor(tabId: PageId, title: string, eyebrow: string, description: string, mode: "create" | "edit", saved?: DataStore[PageId][number]) {
    const { getValue, ...renders } = getEditPageRenders(tabId, this.data, saved);
    this.editPage = {
      title,
      eyebrow,
      description,
      mode,
      saveLabel: "Save",
      onClose: this.closeEditor,
      onSave: () => {
        console.log("Admin form", { tabId, mode, value: getValue() });
        this.closeEditor();
      },
      ...renders,
    };
  }
  getStoreData = async () => {
    if (this.isLoadingData) return;
    this.isLoadingData = true;
    this.loadError = "";

    const jsonReviver = (key: any, val: any) => {
      if (typeof val === "string" && val.startsWith(IdString.prefix))
        return new IdString(val.slice(IdString.prefix.length));
      return val;
    };

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