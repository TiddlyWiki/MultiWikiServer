import { customElement } from "lit/decorators.js";
import { JSXElement } from '../utils/JSXElement';

declare global {
  interface CustomElements {
    'mws-plugins-page': JSX.SimpleAttrs<{}, PluginsPage>;
  }
}

@customElement("mws-plugins-page")
export class PluginsPage extends JSXElement {
  protected render() {
    return (
      <div class="page-content">
        <mdui-card variant="outlined" style="margin: 16px;">
          <div style="padding: 24px;">
            <div class="md-typescale-headline-medium" style="margin-bottom: 16px;">
              Plugins
            </div>
            <div class="md-typescale-body-medium" style="margin-bottom: 24px; color: var(--mdui-color-on-surface-variant);">
              Plugins add features and modify wiki behavior. Install them to enhance your wikis.
            </div>
            
            <mdui-list>
              <mdui-list-item>
                <mdui-icon webjsx-attr-slot="icon" name="extension"></mdui-icon>
                Markdown Plugin
                <div webjsx-attr-slot="description">Enabled · Adds markdown support for editing</div>
              </mdui-list-item>
              <mdui-list-item>
                <mdui-icon webjsx-attr-slot="icon" name="extension"></mdui-icon>
                CodeMirror Editor
                <div webjsx-attr-slot="description">Enabled · Advanced code editor with syntax highlighting</div>
              </mdui-list-item>
              <mdui-list-item>
                <mdui-icon webjsx-attr-slot="icon" name="extension"></mdui-icon>
                Search Plugin
                <div webjsx-attr-slot="description">Disabled · Full-text search capabilities</div>
              </mdui-list-item>
            </mdui-list>

            <mdui-button 
              variant="filled" 
              style="margin-top: 16px;"
              icon="add"
            >
              Install Plugin
            </mdui-button>
          </div>
        </mdui-card>
      </div>
    );
  }
}
