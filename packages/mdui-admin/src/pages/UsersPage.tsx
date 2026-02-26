import { FormMaker, FormState, ItemStorePage } from '../utils/forms';
import { dataService, Bag, User } from '../services/data.service';
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";
import { map } from 'rxjs';


export function createUsersFormState(this: ItemStorePage<User, {}>) {
  return new FormState((F: FormMaker<User>) => ({
    username: F.TextField({
      label: 'Username',
      required: true,
      default: '',
      valid: (v: string) => !v?.trim() ? 'Username is required' : undefined,
    }),
    email: F.TextField({
      label: 'Email',
      type: 'email',
      required: true,
      default: '',
      valid: (v: string) => !v?.trim() ? 'Email is required' : undefined,
    }),
    role_ids: F.MultiSelect({
      label: 'Roles',
      default: [],
      suggestions: dataService.roles.changes$.pipe(
        map(roles => roles.map(r => ({ value: r.id, label: r.name })))
      ),
    }),
    password: F.TextField({
      label: 'Password',
      type: 'password',
      required: true,
      default: '',
      valid: (v: string, all: User) => v.length < 4 ? 'Password must be at least 4 characters' : undefined,
    }),
    confirmPassword: F.TextField({
      label: 'Confirm Password',
      type: 'password',
      required: true,
      default: '',
      valid: (v: string, all: User) => v !== all.password ? 'Passwords do not match' : undefined,
    })
  }), {
    store: dataService.users,
    idKey: 'username',
    onCancel: () => this.closePopup(),
    onSubmit: async (values) => { await this.doSave(values); },
    formTitle: 'User',
    listTitle: 'Users',
    listDescription: <>
      Users represent individuals who can access and interact with the system. 
      Each user can have specific roles and permissions.
    </>,
    listEmptyText: `No users yet. Click "New User" to create one.`,
    createItemLabel: 'New User',
    renderListItem: (user: User) => {
      const listref = createHybridRef<HTMLElement>();
      return (
        <mdui-list-item ref={listref} onclick={() => this.loadItemForEdit(user, listref)}>
          <mdui-icon webjsx-attr-slot="icon" name="person"></mdui-icon>
          {user.username}
          {user.email && (
            <div webjsx-attr-slot="description">{user.email}</div>
          )}
        </mdui-list-item>
      );
    }
  });
}
createUsersFormState.tabTitle = "Users";