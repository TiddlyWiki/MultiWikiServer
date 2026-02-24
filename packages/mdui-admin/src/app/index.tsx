
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
        {/* Top App Bar */}
        <mdui-top-app-bar>
          <mdui-top-app-bar-title>MWS Admin</mdui-top-app-bar-title>
        </mdui-top-app-bar>

        {/* Navigation Tabs */}
        <mdui-tabs value={activeTab} onchange={handleTabChange}>
          <mdui-tab value="wikis">Wikis</mdui-tab>
          <mdui-tab value="templates">Templates</mdui-tab>
          <mdui-tab value="bags">Bags</mdui-tab>
          <mdui-tab value="plugins">Plugins</mdui-tab>
        </mdui-tabs>

        {/* Page Content */}
        <div style="flex: 1; overflow: auto; background: var(--mdui-color-surface-container-low);">
          {activeTab === 'wikis' && <mws-wikis-page />}
          {activeTab === 'templates' && <mws-templates-page />}
          {activeTab === 'bags' && <mws-bags-page />}
          {activeTab === 'plugins' && <mws-plugins-page />}
        </div>
      </div>
    );
  }
}
