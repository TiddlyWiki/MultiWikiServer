import { FormMaker, FormState, ItemStorePage } from '../utils/forms';
import { dataService, Bag, Role } from '../services/data.service';
import { createHybridRef } from "@tiddlywiki/jsx-runtime";

export function createRolesFormState(this: ItemStorePage<Role, {}>) {
  return new FormState((F: FormMaker<Role>) => ({
    name: F.TextField({
      label: 'Role Name',
      required: true,
      default: '',
      valid: (v) => !v?.trim() ? 'Role name is required' : undefined,
    }),
    description: F.TextArea({
      label: 'Description',
      default: '',
    }),
  }), {
    store: dataService.roles,
    idKey: 'name',
    onCancel: () => this.closePopup(),
    onSubmit: async (values) => { await this.doSave(values); },
    formTitle: 'Role',
    listTitle: 'Roles',
    listDescription: <>
      Roles define the permissions and access levels for users within the system.
    </>,
    listEmptyText: `No roles yet. Click "New Role" to create one.`,
    createItemLabel: 'New Role',
    renderListItem: (role: Role) => {
      const listref = createHybridRef<HTMLElement>();
      return (
        <mdui-list-item ref={listref} onclick={() => this.loadItemForEdit(role, listref)}>
          <mdui-icon webjsx-attr-slot="icon" name="folder"></mdui-icon>
          {role.name}
          {role.description && (
            <div webjsx-attr-slot="description">{role.description}</div>
          )}
        </mdui-list-item>
      );
    }
  });
}
createRolesFormState.tabTitle = "Roles";