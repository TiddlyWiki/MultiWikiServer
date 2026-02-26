import { customElement } from "lit/decorators.js";
import { FormMaker, FormState, ItemStorePage } from '../utils/forms';
import { dataService, DataStore, Plugin } from '../services/data.service';
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";

export function createPluginsFormState(this: ItemStorePage<Plugin, {}>) {
  return new FormState((F: FormMaker<Plugin>) => ({
    path: F.TextField({
      label: 'Plugin Path',
      required: true,
      default: '',
      placeholder: '$:/plugins/tiddlywiki/markdown',
      helperText: 'The TiddlyWiki plugin path (e.g. $:/plugins/tiddlywiki/markdown)',
      valid: (v) => !v?.trim() ? 'Plugin path is required' : undefined,
    }),
    description: F.TextArea({
      label: 'Description',
      default: '',
    }),
    
  }), {
    store: dataService.plugins,
    idKey: 'path',
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
    renderListItem: (plugin: Plugin) => {
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
  });
}
createPluginsFormState.tabTitle = "Plugins";
