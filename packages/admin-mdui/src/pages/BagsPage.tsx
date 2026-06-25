import { FormMaker, FormState, ItemStorePage } from '../utils/forms';
import { dataService, Bag } from '../services/data.service';
import { createHybridRef } from "@tiddlywiki/jsx-runtime";

export function createBagsFormState(this: ItemStorePage<Bag, {}>) {
  return new FormState((F: FormMaker<Bag>) => ({
    name: F.TextField({
      label: 'Bag Name',
      required: true,
      default: '',
      valid: (v) => !v?.trim() ? 'Bag name is required' : undefined,
    }),
    description: F.TextArea({
      label: 'Description',
      default: '',
    }),
  }), {
    store: dataService.bags,
    idKey: 'name',
    onCancel: () => this.closePopup(),
    onSubmit: async (values) => { await this.doSave(values); },
    formTitle: 'Bag',
    listTitle: 'Bags',
    listDescription: <>
      Bags store the pages you edit in wikis. Each bag can contain tiddlers (pages).
    </>,
    listEmptyText: `No bags yet. Click "New Bag" to create one.`,
    createItemLabel: 'New Bag',
    renderListItem: (bag: Bag) => {
      const listref = createHybridRef<HTMLElement>();
      return (
        <mdui-list-item ref={listref} onclick={() => this.loadItemForEdit(bag, listref)}>
          <mdui-icon webjsx-attr-slot="icon" name="folder"></mdui-icon>
          {bag.name}
          {bag.description && (
            <div webjsx-attr-slot="description">{bag.description}</div>
          )}
        </mdui-list-item>
      );
    }
  });
}
createBagsFormState.tabTitle = "Bags";