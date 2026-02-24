import { customElement } from "lit/decorators.js";
import { JSXElement } from '../utils/JSXElement';

declare global {
  interface CustomElements {
    'mws-wikis-page': JSX.SimpleAttrs<{}, WikisPage>;
  }
}

@customElement("mws-wikis-page")
export class WikisPage extends JSXElement {
  protected render() {
    return (
      <div class="page-content">
        <mdui-card variant="outlined" style="margin: 16px;">
          <div style="padding: 24px;">
            <div class="md-typescale-headline-medium" style="margin-bottom: 16px;">
              Wikis
            </div>
            <div class="md-typescale-body-medium" style="margin-bottom: 24px; color: var(--mdui-color-on-surface-variant);">
              Create and manage your wikis. Each wiki uses a template and provides parameters like writable bags.
            </div>
            
            <mdui-list>
              <mdui-list-item>
                <mdui-icon webjsx-attr-slot="icon" name="description"></mdui-icon>
                Example Wiki 1
                <div webjsx-attr-slot="description">Using Default Template · Writing to main-bag</div>
              </mdui-list-item>
              <mdui-list-item>
                <mdui-icon webjsx-attr-slot="icon" name="description"></mdui-icon>
                Example Wiki 2
                <div webjsx-attr-slot="description">Using Blog Template · Writing to blog-bag</div>
              </mdui-list-item>
            </mdui-list>

            <mdui-button 
              variant="filled" 
              style="margin-top: 16px;"
              icon="add"
            >
              New Wiki
            </mdui-button>
          </div>
        </mdui-card>
      </div>
    );
  }
}
