import { customElement } from "lit/decorators.js";
import { FormState, ItemStorePage } from '../utils/forms';
import { dataService, DataStore, Bag } from '../services/data.service';
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";

declare global {
  interface MyCustomElements {
    'mws-bags-page': JSX.SimpleAttrs<{}, BagsPage>;
  }
}

@customElement("mws-bags-page")
export class BagsPage extends ItemStorePage<Bag> {
  store: DataStore<Bag>;

  constructor() {
    super();
    this.store = dataService.bags;
  }

  forms = new FormState({
    name: FormState.TextField({
      label: 'Bag Name',
      required: true,
      default: '',
      valid: (v) => !v?.trim() ? 'Bag name is required' : undefined,
    }),
    description: FormState.TextArea({
      label: 'Description',
      default: '',
    }),
  }, {
    getID: (): string => this.forms.getValue('name'),
    onCancel: () => this.closePopup(),
    onSubmit: async (values) => { await this.doSave(values); },
    formTitle: 'Bag',
    listTitle: 'Bags',
    listDescription: <>
      Bags store the pages you edit in wikis. Each bag can contain tiddlers (pages).
    </>,
    listEmptyText: `No bags yet. Click "New Bag" to create one.`,
    createItemLabel: 'New Bag',
  });

  renderListItem(bag: Bag) {
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
}
