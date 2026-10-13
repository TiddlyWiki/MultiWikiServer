import { AdminTab, AppAdmin } from "./app-admin";
import { ListPage, RichListItem } from "./app-shell";
import { requestUpdate } from "./requestUpdate";
import type { DataStore } from "./definition/tabs";
import type { PageId } from "./app-admin";
import editIcon from "@material-symbols/svg-400/outlined/edit.svg";
import { MaterialSymbol } from "./material-symbol";

export class AppTabController {
  constructor(public context: AppAdmin) { }

  private renderEditAction(tabId: PageId, record: DataStore[PageId][number], title: string, eyebrow: string) {
    const tab = this.tabs.find((tab) => tab.id === tabId)!;
    return <button class="row-action-button" type="button"
      aria-label={`Edit ${title}`} title={`Edit ${title}`}
      disabled={this.context.isLoadingData}
      onclick={() => this.context.openEdit(tabId, record, title, eyebrow, tab.description)}>
      <MaterialSymbol icon={editIcon} webjsx-attr-aria-hidden="true" />
      <span>Edit</span>
    </button>;
  }


  navigationLink(tab: AdminTab) {
    return (
      <button
        class={
          this.activeTab.id === tab.id
            ? "app-nav-link is-active"
            : "app-nav-link"
        }
        type="button"
        aria-current={this.activeTab.id === tab.id ? "page" : undefined}
        onclick={() => {
          this.activeTab = tab;
        }}
      >
        {tab.label}
      </button>
    );
  }

  renderTabs = () => <>
    {this.tabs.map((tab) => <>
      {tab.dividerBefore ? <hr class="app-nav-divider" /> : null}
      {this.navigationLink(tab)}
    </>)}
  </>;

  renderListContent = () => {
    const tab = this.activeTab;
    return <ListPage
      title={tab.label}
      eyebrow={tab.eyebrow}
      description={tab.description}
      ariaLabel={tab.ariaLabel}
      renderActions={() => (
        <button
          class="primary-button"
          type="button"
          disabled={!this.context.data || this.context.isLoadingData}
          onclick={() => this.context.openCreate(tab.id, tab.createLabel, tab.eyebrow, tab.description)}
        >
          {tab.createLabel}
        </button>
      )}
      renderContent={() => {
        if (!this.context.data) return this.context.isLoadingData ? <>
          <RichListItem placeholder />
          <RichListItem placeholder />
        </> : null;
        if (!this.context.data[tab.id].length) return <p role="status">No {tab.label.toLowerCase()}.</p>;
        return tab.renderListContent();
      }}
    />;
  }

  private readonly tabs: readonly AdminTab[] = [
    {
      id: "wikis",
      label: "Wikis",
      ariaLabel: "Wikis",
      createLabel: "Create wiki",
      eyebrow: "Your thoughts",
      description: "Final wiki instances built from a template plus per-wiki customizations.",
      renderListContent: () => this.context.data.wikis.map((wiki: DataStore["wikis"][number]) => <RichListItem
        key={wiki.id.toString()}
        renderActions={() => this.renderEditAction("wikis", wiki, wiki.displayName || wiki.slug, "Your thoughts")}
        renderMain={() => <>
          <h3><a class="rich-list-title-link" href={pathPrefix + embeddedServerResponse.rootRoutes.wiki + "/" + wiki.slug.split("/").map(encodeURIComponent).join("/")}>{wiki.displayName || wiki.slug}</a></h3>
          {wiki.displayName && wiki.displayName !== wiki.slug ? <p>{wiki.slug}</p> : null}
          {wiki.description ? <p>{wiki.description}</p> : null}
          <p>Template: {wiki.templateName}</p>
        </>}
        renderMeta={() => <>
          <p>Default bag: {wiki.effectiveWritableBags.find((row) => row.prefix === "")?.bagName || "None"}</p>
          <p>{wiki.effectiveWritableBags.length} writable rules</p>
          <p>{wiki.effectiveReadonlyBags.length} readonly bags</p>
          <p>{wiki.effectivePluginSet.length} plugins</p>
        </>}
      />),
    },
    {
      id: "templates",
      label: "Templates",
      ariaLabel: "Templates",
      createLabel: "Create template",
      eyebrow: "Wiki Blueprints",
      description: "Reusable recipe definitions. Changes made to a template apply to every wiki using it.",
      renderListContent: () => this.context.data.templates.map((template: DataStore["templates"][number]) => <RichListItem
        key={template.id.toString()}
        renderActions={() => this.renderEditAction("templates", template, template.name, "Wiki Blueprints")}
        renderMain={() => <>
          <h3>{template.name}</h3>
          {template.description ? <p>{template.description}</p> : null}
          <p>TiddlyWiki: {template.twVersion || "Site default"}</p>
          {template.customHtmlEnabled ? <p>Custom HTML shell</p> : null}
        </>}
        renderMeta={() => <>
          <p>{this.context.data.wikis.filter((wiki: DataStore["wikis"][number]) => wiki.templateName === template.name).length} dependent wikis</p>
          <p>{template.readonlyBags.length} readonly bags</p>
          <p>{template.writablePrefixBags.length} writable rules</p>
          <p>Updated: <time datetime={template.lastUpdatedAt}>{new Date(template.lastUpdatedAt).toLocaleString()}</time></p>
        </>}
      />),
    },
    {
      id: "bags",
      label: "Bags",
      ariaLabel: "Bags",
      createLabel: "Create bag",
      eyebrow: "Tiddler Storage",
      description: "Concrete tiddler storage with role-based access control.",
      renderListContent: () => this.context.data.bags.map((bag: DataStore["bags"][number]) => <RichListItem
        key={bag.id.toString()}
        renderActions={() => this.renderEditAction("bags", bag, bag.name, "Tiddler Storage")}
        renderMain={() => <>
          <h3>{bag.name}</h3>
          {bag.description ? <p>{bag.description}</p> : null}
          <p>{bag.bagPermissions.length
            ? "Permissions: " + bag.bagPermissions.map((row) => `${row.role} (${row.level.replace(/^[A-Z]_/, "")})`).join(", ")
            : "No permissions assigned."}</p>
        </>}
        renderMeta={() => <>
          <p>Used by {this.context.data.wikis.filter((wiki: DataStore["wikis"][number]) =>
            wiki.effectiveReadonlyBags.includes(bag.name) || wiki.effectiveWritableBags.some((row) => row.bagName === bag.name)
          ).length} wikis</p>
          <p>Referenced by {this.context.data.templates.filter((template: DataStore["templates"][number]) =>
            template.readonlyBags.includes(bag.name) || template.writablePrefixBags.some((row) => row.bagName === bag.name)
          ).length} templates</p>
        </>}
      />),
    },
    {
      id: "roles",
      label: "Roles",
      ariaLabel: "Roles",
      createLabel: "Create role",
      eyebrow: "Access profiles",
      description: "Named access profiles that can be assigned to user accounts.",
      dividerBefore: true,
      renderListContent: () => this.context.data.roles.map((role: DataStore["roles"][number]) => <RichListItem
        key={role.id.toString()}
        renderActions={() => this.renderEditAction("roles", role, role.name, "Access profiles")}
        renderMain={() => <>
          <h3>{role.name}</h3>
          {role.description ? <p>{role.description}</p> : null}
        </>}
        renderMeta={() => <p>Assigned to {this.context.data.users.filter((user: DataStore["users"][number]) => user.userRoles.includes(role.name)).length} users</p>}
      />),
    },
    {
      id: "users",
      label: "Users",
      ariaLabel: "Users",
      createLabel: "Create user",
      eyebrow: "Account logins",
      description: "User accounts with assigned roles.",
      renderListContent: () => this.context.data.users.map((user: DataStore["users"][number]) => <RichListItem
        key={user.id.toString()}
        renderActions={() => this.renderEditAction("users", user, user.username, "Account logins")}
        renderMain={() => <>
          <h3>{user.username}</h3>
          <p>{user.email}</p>
        </>}
        renderMeta={() => <p>{user.userRoles.length ? "Roles: " + user.userRoles.join(", ") : "No roles assigned."}</p>}
      />),
    },
  ];

  @requestUpdate accessor activeTab: AdminTab = this.tabs[0];

}