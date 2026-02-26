import { customElement, state } from "lit/decorators.js";
import { Subscription } from 'rxjs';
import { JSXElement } from '../utils/JSXElement';
import { PopupContainer } from '../components/mdui-popup';
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";
import { FormState, FormsComp } from '../utils/forms';
import { dataService, Plugin } from '../services/data.service';

declare global {
  interface MyCustomElements {
    'mws-plugins-page': JSX.SimpleAttrs<{}, PluginsPage>;
  }
}

@customElement("mws-plugins-page")
export class PluginsPage extends JSXElement {
  @state() accessor showInstallPopup = false;
  @state() accessor installedPlugins: Plugin[] = [];

  private _dataSub!: Subscription;

  private installButton = createHybridRef<HTMLElement>();
  private popup = createHybridRef<PopupContainer>();

  async connectedCallback() {
    super.connectedCallback();
    this.forms.events.on('change', this._onFormsChange);
    this._dataSub = dataService.plugins$.subscribe(plugins => {
      this.installedPlugins = plugins;
    });
    await dataService.loadPlugins();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.forms.events.off('change', this._onFormsChange);
    this._dataSub?.unsubscribe();
  }

  private forms = new FormState({
    pluginPath: FormState.TextField({
      label: 'Plugin Path',
      required: true,
      default: '',
      placeholder: '$:/plugins/tiddlywiki/markdown',
      helperText: 'The TiddlyWiki plugin path (e.g. $:/plugins/tiddlywiki/markdown)',
      valid: (v) => !v?.trim() ? 'Plugin path is required' : undefined,
    }),
    pluginDescription: FormState.TextArea({
      label: 'Description',
      default: '',
    }),
  }, {
    onCancel: () => this.closePopup(),
    onSubmit: async (values) => { await this.doInstall(values); },
    submitLabel: 'Install',
  });

  private closePopup = () => {
    this.popup.current?.close(() => {
      this.showInstallPopup = false;
      this.forms.resetValues();
    });
  };

  private doInstall = async (values: Record<string, any>) => {
    try {
      await dataService.installPlugin(values);
      this.closePopup();
    } catch (error) {
      console.error('Error installing plugin:', error);
      alert('Failed to install plugin');
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
              Plugins
            </div>
            <div style="margin-bottom: 24px; color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
              Plugins add features and modify wiki behavior. Install them to enhance your wikis.
            </div>

            {this.installedPlugins.length > 0 ? (
              <mdui-list>
                {this.installedPlugins.map(plugin => (
                  <mdui-list-item>
                    <mdui-icon webjsx-attr-slot="icon" name="extension"></mdui-icon>
                    {plugin.path}
                    <div webjsx-attr-slot="description">
                      {plugin.description ? ` · ${plugin.description}` : ''}
                    </div>
                  </mdui-list-item>
                ))}
              </mdui-list>
            ) : (
              <div style="padding: 24px; text-align: center; color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
                No plugins installed yet. Click "Install Plugin" to add one.
              </div>
            )}

            <mdui-button
              ref={this.installButton}
              variant="filled"
              style="margin-top: 16px;"
              icon="add"
              onclick={() => { this.showInstallPopup = true; }}
            >
              Install Plugin
            </mdui-button>
          </div>
        </mdui-card>

        {this.showInstallPopup && (
          <PopupContainer
            ref={this.popup}
            source={this.installButton.current}
            cardStyle="max-width: 80vw; max-height: 80vh;"
            oncancel={this.closePopup}
          >
            <mdui-forms-popup>
              <display-content slot="title">Install Plugin</display-content>
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
