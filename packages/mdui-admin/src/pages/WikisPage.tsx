import { customElement } from "lit/decorators.js";
import { map } from 'rxjs';
import { FormState, ItemStorePage } from '../utils/forms';
import { dataService, DataStore, Wiki } from '../services/data.service';
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";

export function createWikisFormState(this: ItemStorePage<Wiki, {}>) {
  return new FormState({
    name: FormState.TextField({
      label: 'Wiki Name',
      required: true,
      default: '',
      valid: (v) => !v?.trim() ? 'Wiki name is required' : undefined,
    }),
    description: FormState.TextArea({
      label: 'Description',
      default: '',
    }),
    template: FormState.Select({
      label: 'Template',
      default: '',
      options: dataService.templates.changes$.pipe(
        map(templates => templates.map(t => ({ value: t.name, label: t.name })))
      ),
    }),
    writableBag: FormState.Select({
      label: 'Writable Bag',
      default: '',
      options: dataService.bags.changes$.pipe(
        map(bags => bags.map(b => ({ value: b.name, label: b.name })))
      ),
    }),
  }, {
    store: dataService.wikis,
    idKey: 'name',
    onInit: async (item?: Wiki) => {
      await Promise.all([
        dataService.templates.loadAll(),
        dataService.bags.loadAll(),
      ]);
    },
    onCancel: () => this.closePopup(),
    onSubmit: async (values) => { await this.doSave(values); },
    formTitle: 'Wiki',
    listTitle: 'Wikis',
    listDescription: <>
      Create and manage your wikis. Each wiki uses a template and provides parameters like writable bags.
    </>,
    listEmptyText: `No wikis yet. Click "New Wiki" to create one.`,
    createItemLabel: 'New Wiki',
    renderListItem: (wiki: Wiki) => {
      const listref = createHybridRef<HTMLElement>();
      return (
        <mdui-list-item ref={listref} onclick={() => this.loadItemForEdit(wiki, listref)}>
          <mdui-icon webjsx-attr-slot="icon" name="description"></mdui-icon>
          {wiki.name}
          <div webjsx-attr-slot="description">
            {wiki.template ? `Using ${wiki.template}` : 'No template'} · Writing to {wiki.writableBag}
          </div>
        </mdui-list-item>
      );
    }
  });
}
