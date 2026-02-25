
import { customElement, property, state } from "lit/decorators.js";
import { JSXElement } from '../utils/JSXElement';
import { WikisPage, TemplatesPage, BagsPage, PluginsPage } from '../pages';
import "../pages";
import { Tabs } from "mdui";

declare global {
  interface CustomElements {
    'mws-app': JSX.SimpleAttrs<{}, App>;
  }
}

@customElement("mws-app")
export class App extends JSXElement {

  protected render() {
    const [activeTab, setActiveTab] = this.useState('wikis');

    const handleTabChange: JSX.EventHandler<Tabs, Event> = (e) => {
      setActiveTab(e.currentTarget.value || 'wikis');
    };

    console.log("Rendering App with activeTab:", activeTab);

    return (
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <div style="background-color: rgb(var(--mdui-color-surface));">
          <div style="display: flex; align-items: center; padding: 0 16px; height: 64px;">
            <mdui-icon name="admin_panel_settings" style="margin-right: 8px;"></mdui-icon>
            <div class="md-typescale-headline-small">TiddlyWiki Admin</div>
          </div>
        </div>

        <div style="flex: 1;">
          <mdui-tabs value={activeTab} onchange={handleTabChange}>
            <mdui-tab value="wikis">Wikis</mdui-tab>
            <mdui-tab value="templates">Templates</mdui-tab>
            <mdui-tab value="bags">Bags</mdui-tab>
            <mdui-tab value="plugins">Plugins</mdui-tab>
          </mdui-tabs>
          {activeTab === 'wikis' && <mws-wikis-page />}
          {activeTab === 'templates' && <mws-templates-page />}
          {activeTab === 'bags' && <mws-bags-page />}
          {activeTab === 'plugins' && <mws-plugins-page />}
        </div>
      </div>
    );
  }
}


function randomHelpMessage() {
  return <>
    <div style="height: 1px; background-color: rgb(var(--mdui-color-outline));"></div>
    <div style="padding: 16px; color: var(--mdui-color-on-surface-variant);">
      Manage your TiddlyWiki instances, templates, bags, and plugins all in one place.
    </div>
    <div style="height: 1px; background-color: rgb(var(--mdui-color-outline));"></div>
    <div style="display: flex; padding: 16px; gap: 16px;">
      <mdui-button variant="outlined" icon="settings">Settings</mdui-button>
      <mdui-button variant="outlined" icon="sync">Sync</mdui-button>
      <mdui-button variant="outlined" icon="help">Help</mdui-button>
    </div>
    <div style="height: 1px; background-color: rgb(var(--mdui-color-outline));"></div>
    <div style="padding: 16px; color: var(--mdui-color-on-surface-variant);">
      Select a tab to view and manage your wikis, templates, bags, and plugins.
    </div>
    <div style="height: 1px; background-color: rgb(var(--mdui-color-outline));"></div>
    <div style="display: flex; padding: 16px; gap: 16px;">
      <mdui-button variant="outlined" icon="add">New Wiki</mdui-button>
      <mdui-button variant="outlined" icon="add">New Template</mdui-button>
      <mdui-button variant="outlined" icon="add">New Bag</mdui-button>
      <mdui-button variant="outlined" icon="add">New Plugin</mdui-button>
    </div>
    <div style="height: 1px; background-color: rgb(var(--mdui-color-outline));"></div>
    <div style="padding: 16px; color: var(--mdui-color-on-surface-variant);">
      Use the buttons above to quickly create new wikis, templates, bags, or plugins.
    </div>
    <div style="height: 1px; background-color: rgb(var(--mdui-color-outline));"></div>
    <div style="padding: 16px; color: var(--mdui-color-on-surface-variant);">
      Click on a wiki, template, bag, or plugin in the list to view details, edit settings, or perform actions like delete or duplicate.
    </div>
    <div style="height: 1px; background-color: rgb(var(--mdui-color-outline));"></div>
    <div style="padding: 16px; color: var(--mdui-color-on-surface-variant);">
      This admin interface is designed to be intuitive and user-friendly, making it easy to manage your TiddlyWiki instances and resources.
    </div>
    <div style="height: 1px; background-color: rgb(var(--mdui-color-outline));"></div>
    <div style="padding: 16px; color: var(--mdui-color-on-surface-variant);">
      For more advanced management options, consider using the command line interface or API for scripting and automation.
    </div>
    <div style="height: 1px; background-color: rgb(var(--mdui-color-outline));"></div>
    <div style="padding: 16px; color: var(--mdui-color-on-surface-variant);">
      Thank you for using TiddlyWiki Admin! We hope it helps you manage your wikis more efficiently and effectively.
    </div>
    <div style="height: 1px; background-color: rgb(var(--mdui-color-outline));"></div>
    <div style="padding: 16px; color: var(--mdui-color-on-surface-variant);">
      If you have any feedback or suggestions for improvement, please don't hesitate to reach out to us. We're always looking for ways to make TiddlyWiki Admin better!
    </div>
    <div style="height: 1px; background-color: rgb(var(--mdui-color-outline));"></div>
    <div style="padding: 16px; color: var(--mdui-color-on-surface-variant);">
      Happy wiki-ing!
    </div>
  </>
}