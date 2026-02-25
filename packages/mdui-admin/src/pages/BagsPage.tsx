import { customElement, state } from "lit/decorators.js";
import { Subscription } from 'rxjs';
import { JSXElement } from '../utils/JSXElement';
import { PopupContainer } from '../components/mdui-popup';
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";
import { FormState, FormsComp } from '../utils/forms';
import { dataService, Bag } from '../services/data.service';

declare global {
  interface CustomElements {
    'mws-bags-page': JSX.SimpleAttrs<{}, BagsPage>;
  }
}

@customElement("mws-bags-page")
export class BagsPage extends JSXElement {
  @state() accessor showNewBagPopup = false;
  @state() accessor savedBags: Bag[] = [];

  private _dataSub!: Subscription;

  private newBagButton = createHybridRef<HTMLElement>();
  private popup = createHybridRef<PopupContainer>();

  async connectedCallback() {
    super.connectedCallback();
    this.forms.events.on('change', this._onFormsChange);
    this._dataSub = dataService.bags$.subscribe(bags => {
      this.savedBags = bags;
    });
    await dataService.loadBags();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.forms.events.off('change', this._onFormsChange);
    this._dataSub?.unsubscribe();
  }

  private forms = new FormState({
    bagName: FormState.TextField({
      label: 'Bag Name',
      required: true,
      default: '',
      valid: (v) => !v?.trim() ? 'Bag name is required' : undefined,
    }),
    bagDescription: FormState.TextArea({
      label: 'Description',
      default: '',
    }),
  }, {
    onCancel: () => this.closePopup(),
    onSubmit: async (values) => { await this.doSave(values); },
  });

  private closePopup = () => {
    this.popup.current?.close(() => {
      this.showNewBagPopup = false;
      this.forms.resetValues();
    });
  };

  private doSave = async (values: Record<string, any>) => {
    try {
      await dataService.saveBag(values);
      this.closePopup();
    } catch (error) {
      console.error('Error saving bag:', error);
      alert('Failed to save bag');
    }
  };

  private _onFormsChange = () => this.requestUpdate();

  protected render() {
    const submitLabel = this.forms.submitLabel;
    const cancelLabel = this.forms.cancelLabel;

    return (
      <div class="page-content">
        <mdui-card variant="outlined" style="margin: 16px;">
          <div style="padding: 24px;">
            <div style="margin-bottom: 16px; font-size: 28px; font-weight: 400; line-height: 36px;">
              Bags
            </div>
            <div style="margin-bottom: 24px; color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
              Bags store the pages you edit in wikis. Each bag can contain tiddlers (pages).
            </div>

            {this.savedBags.length > 0 ? (
              <mdui-list>
                {this.savedBags.map(bag => (
                  <mdui-list-item>
                    <mdui-icon webjsx-attr-slot="icon" name="folder"></mdui-icon>
                    {bag.name}
                    {bag.description && (
                      <div webjsx-attr-slot="description">{bag.description}</div>
                    )}
                  </mdui-list-item>
                ))}
              </mdui-list>
            ) : (
              <div style="padding: 24px; text-align: center; color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
                No bags yet. Click "New Bag" to create one.
              </div>
            )}

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

        {this.showNewBagPopup && (
          <PopupContainer
            ref={this.popup}
            source={this.newBagButton.current}
            cardStyle="max-width: 80vw; max-height: 80vh;"
            oncancel={this.closePopup}
          >
            <mdui-forms-popup>
              <display-content slot="title">Create New Bag</display-content>
              <display-content slot="fields">
                <FormsComp state={this.forms}>
                  {this.forms.renderSlots()}
                </FormsComp>
              </display-content>
              <display-content slot="actions">
                <mdui-button variant="text" onclick={() => this.forms.options.onCancel?.()}>
                  {cancelLabel}
                </mdui-button>
                <mdui-button variant="filled" onclick={() => this.forms.handleSubmit()}>
                  {submitLabel}
                </mdui-button>
              </display-content>
            </mdui-forms-popup>
          </PopupContainer>
        )}
      </div>
    );
  }
}
