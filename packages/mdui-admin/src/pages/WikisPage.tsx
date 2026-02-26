import { customElement, state } from "lit/decorators.js";
import { Subscription } from 'rxjs';
import { JSXElement } from '../utils/JSXElement';
import { PopupContainer } from '../components/mdui-popup';
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";
import { FormState, FormsComp } from '../utils/forms';
import { dataService, Wiki } from '../services/data.service';

declare global {
  interface MyCustomElements {
    'mws-wikis-page': JSX.SimpleAttrs<{}, WikisPage>;
  }
}

@customElement("mws-wikis-page")
export class WikisPage extends JSXElement {
  @state() accessor showNewWikiPopup = false;
  @state() accessor savedWikis: Wiki[] = [];

  private _dataSub!: Subscription;

  private newWikiButton = createHybridRef<HTMLElement>();
  private popup = createHybridRef<PopupContainer>();

  private availableBags = ['main-bag', 'blog-bag', 'docs-bag', 'system-bag', 'plugins-bag'];

  async connectedCallback() {
    super.connectedCallback();
    this.forms.events.on('change', this._onFormsChange);
    this._dataSub = dataService.wikis$.subscribe(wikis => {
      this.savedWikis = wikis;
    });
    await Promise.all([dataService.loadWikis(), dataService.loadTemplates()]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.forms.events.off('change', this._onFormsChange);
    this._dataSub?.unsubscribe();
  }

  private forms = new FormState({
    wikiName: FormState.TextField({
      label: 'Wiki Name',
      required: true,
      default: '',
      valid: (v) => !v?.trim() ? 'Wiki name is required' : undefined,
    }),
    wikiDescription: FormState.TextArea({
      label: 'Description',
      default: '',
    }),
    template: FormState.Select({
      label: 'Template',
      default: '',
      options: dataService.templateOptions$,
    }),
    writableBag: FormState.Select({
      label: 'Writable Bag',
      default: 'main-bag',
      options: [
        { value: 'main-bag', label: 'main-bag' },
        { value: 'blog-bag', label: 'blog-bag' },
        { value: 'docs-bag', label: 'docs-bag' },
        { value: 'system-bag', label: 'system-bag' },
        { value: 'plugins-bag', label: 'plugins-bag' },
      ],
    }),
  }, {
    onCancel: () => this.closePopup(),
    onSubmit: async (values) => { await this.doSave(values); },
  });

  private closePopup = () => {
    this.popup.current?.close(() => {
      this.showNewWikiPopup = false;
      this.forms.resetValues();
    });
  };

  private doSave = async (values: Record<string, any>) => {
    try {
      await dataService.saveWiki(values);
      this.closePopup();
    } catch (error) {
      console.error('Error saving wiki:', error);
      alert('Failed to save wiki');
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
              Wikis
            </div>
            <div style="margin-bottom: 24px; color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
              Create and manage your wikis. Each wiki uses a template and provides parameters like writable bags.
            </div>

            {this.savedWikis.length > 0 ? (
              <mdui-list>
                {this.savedWikis.map(wiki => (
                  <mdui-list-item>
                    <mdui-icon webjsx-attr-slot="icon" name="description"></mdui-icon>
                    {wiki.name}
                    <div webjsx-attr-slot="description">
                      Using {wiki.template} · Writing to {wiki.writableBag}
                    </div>
                  </mdui-list-item>
                ))}
              </mdui-list>
            ) : (
              <div style="padding: 24px; text-align: center; color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
                No wikis yet. Click "New Wiki" to create one.
              </div>
            )}

            <mdui-button
              ref={this.newWikiButton}
              variant="filled"
              style="margin-top: 16px;"
              icon="add"
              onclick={() => { this.showNewWikiPopup = true; }}
            >
              New Wiki
            </mdui-button>
          </div>
        </mdui-card>

        {this.showNewWikiPopup && (
          <PopupContainer
            ref={this.popup}
            source={this.newWikiButton.current}
            cardStyle="max-width: 80vw; max-height: 80vh;"
            oncancel={this.closePopup}
          >
            <mdui-forms-popup>
              <display-content slot="title">Create New Wiki</display-content>
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
