import { customElement } from "lit/decorators.js";
import { FormState, ItemStorePage } from '../utils/forms';
import { dataService, DataStore, Plugin } from '../services/data.service';
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";

declare global {
  interface MyCustomElements {
    'mws-plugins-page': JSX.SimpleAttrs<{}, PluginsPage>;
  }
}

@customElement("mws-plugins-page")
export class PluginsPage extends ItemStorePage<Plugin> {
  store: DataStore<Plugin>;

  constructor() {
    super();
    this.store = dataService.plugins;
  }

  forms = new FormState({
    path: FormState.TextField({
      label: 'Plugin Path',
      required: true,
      default: '',
      placeholder: '$:/plugins/tiddlywiki/markdown',
      helperText: 'The TiddlyWiki plugin path (e.g. $:/plugins/tiddlywiki/markdown)',
      valid: (v) => !v?.trim() ? 'Plugin path is required' : undefined,
    }),
    description: FormState.TextArea({
      label: 'Description',
      default: '',
    }),
    enabled: FormState.Switch({
      label: 'Enabled',
      description: 'Enable this plugin immediately after installation.',
      default: true,
    }),
  }, {
    getID: (): string => this.forms.getValue('path'),
    onCancel: () => this.closePopup(),
    onSubmit: async (values) => { await this.doSave(values); },
    submitLabel: 'Install',
    formTitle: 'Plugin',
    listTitle: 'Plugins',
    listDescription: <>
      Plugins add features and modify wiki behavior. Install them to enhance your wikis.
    </>,
    listEmptyText: `No plugins installed yet. Click "Install Plugin" to add one.`,
    createItemLabel: 'Install Plugin',
  });

  renderListItem(plugin: Plugin) {
    const listref = createHybridRef<HTMLElement>();
    return (
      <mdui-list-item ref={listref} onclick={() => this.loadItemForEdit(plugin, listref)}>
        <mdui-icon webjsx-attr-slot="icon" name="extension"></mdui-icon>
        {plugin.path}
        <div webjsx-attr-slot="description">
          {plugin.enabled ? 'Enabled' : 'Disabled'}
          {plugin.description ? ` · ${plugin.description}` : ''}
        </div>
      </mdui-list-item>
    );
  }
}
