import { customElement, state } from "lit/decorators.js";
import { JSXElement } from '../utils/JSXElement';
import { PopupContainer } from '../components/mdui-popup';
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";

declare global {
  interface CustomElements {
    'mws-bags-page': JSX.SimpleAttrs<{}, BagsPage>;
  }
}

@customElement("mws-bags-page")
export class BagsPage extends JSXElement {
  @state() accessor showNewBagPopup = false;
  private newBagButton = createHybridRef<HTMLElement>();
  private popup = createHybridRef<PopupContainer>();

  @state() accessor bagName = '';
  @state() accessor bagDescription = '';

  private handleSave = async () => {
    // Validate inputs
    if (!this.bagName.trim()) {
      alert('Please enter a bag name');
      return;
    }

    try {
      // TODO: Implement actual save logic (API call)
      console.log('Saving bag:', { name: this.bagName, description: this.bagDescription });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Close popup and reset form
      this.popup.current!.close(() => {
        this.showNewBagPopup = false;
        this.bagName = '';
        this.bagDescription = '';
      });
    } catch (error) {
      console.error('Error saving bag:', error);
      alert('Failed to save bag');
    }
  };

  protected render() {
    return (
      <div class="page-content">
        <mdui-card variant="outlined" style="margin: 16px;">
          <div style="padding: 24px;">
            <div class="md-typescale-headline-medium" style="margin-bottom: 16px;">
              Bags
            </div>
            <div class="md-typescale-body-medium" style="margin-bottom: 24px; color: var(--mdui-color-on-surface-variant);">
              Bags store the pages you edit in wikis. Each bag can contain tiddlers (pages).
            </div>

            <mdui-list>
              <mdui-list-item>
                <mdui-icon webjsx-attr-slot="icon" name="folder"></mdui-icon>
                main-bag
                <div webjsx-attr-slot="description">Contains 42 tiddlers · Used by 3 wikis</div>
              </mdui-list-item>
              <mdui-list-item>
                <mdui-icon webjsx-attr-slot="icon" name="folder"></mdui-icon>
                blog-bag
                <div webjsx-attr-slot="description">Contains 18 tiddlers · Used by 1 wiki</div>
              </mdui-list-item>
              <mdui-list-item>
                <mdui-icon webjsx-attr-slot="icon" name="folder"></mdui-icon>
                docs-bag
                <div webjsx-attr-slot="description">Contains 67 tiddlers · Used by 2 wikis</div>
              </mdui-list-item>
            </mdui-list>

            <mdui-button
              ref={this.newBagButton}
              variant="filled"
              style="margin-top: 16px;"
              icon="add"
              onclick={() => { this.showNewBagPopup = true; }}
            >
              New Bag
            </mdui-button>
          </div>
        </mdui-card>

        {/* New Bag Popup */}
        {this.showNewBagPopup && (
          <PopupContainer
            ref={this.popup}
            source={this.newBagButton.current}
            cardStyle="width: 400px; max-width: 90vw;"
            oncancel={() => {
              this.popup.current!.close(() => {
                this.showNewBagPopup = false;
                this.bagName = '';
                this.bagDescription = '';
              });
            }}
          >
            <div style="padding: 24px;">
              <div class="md-typescale-headline-small" style="margin-bottom: 24px;">
                Create New Bag
              </div>

              <mdui-text-field
                label="Bag Name"
                variant="outlined"
                required
                value={this.bagName}
                oninput={(e) => { this.bagName = (e.target as HTMLInputElement).value; }}
                style="width: 100%; margin-bottom: 16px;"
              />

              <mdui-text-field
                label="Description"
                variant="outlined"
                value={this.bagDescription}
                oninput={(e) => { this.bagDescription = (e.target as HTMLInputElement).value; }}
                style="width: 100%; margin-bottom: 24px;"
                rows={3}
              />

              <div style="display: flex; justify-content: flex-end; gap: 8px;">
                <mdui-button
                  variant="text"
                  onclick={() => {
                    this.popup.current!.close(() => {
                      this.showNewBagPopup = false;
                      this.bagName = '';
                      this.bagDescription = '';
                    });
                  }}
                >
                  Cancel
                </mdui-button>
                <mdui-button
                  variant="filled"
                  onclick={this.handleSave}
                >
                  Save
                </mdui-button>
              </div>
            </div>
          </PopupContainer>
        )}
      </div>
    );
  }
}
