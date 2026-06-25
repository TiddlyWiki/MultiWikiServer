import { createWikisFormState } from './WikisPage';
import { createTemplatesFormState } from './TemplatesPage';
import { createBagsFormState } from './BagsPage';
import { createPluginsFormState } from './PluginsPage';
import { createUsersFormState } from "./UsersPage";
import { createRolesFormState } from "./RolesPage";
import { ItemStorePage } from '../utils/forms';

export const pages = {
  wikis: createWikisFormState,
  templates: createTemplatesFormState,
  bags: createBagsFormState,
  plugins: createPluginsFormState,
  roles: createRolesFormState,
  users: createUsersFormState,
} satisfies Record<string, {
  (this: ItemStorePage<any, any>): any;
  tabTitle: string;
}>;
