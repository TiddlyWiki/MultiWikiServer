type BlockType =
  | "page"
  | "index"
  | "section"
  | "card"
  | "sidebar"
  | "field"
  | "missing-field"
  | "wrap";
type Width = "half" | "full";
type LayoutMode = "grid" | "stack";

type DriverRowFieldOptions = {
  key: string;
  label?: string;
  placeholder?: string;
  options?: readonly string[];
  optionsSource?: string;
};

interface ValidationError extends Error { }
interface StoreError extends Error { }

export interface FieldDriverOptions {
  "template-type": {
    options?: readonly string[]
  };
  "string": {
    placeholder?: string;
    disabledWhen?: string
  };
  "text": {
    placeholder?: string;
    disabledWhen?: string
  };
  "enter-password": {
    placeholder?: string
  };
  "confirm-password": {
    primaryPlaceholder?: string;
    confirmationPlaceholder?: string;
    matchLabel?: string;
    mismatchLabel?: string;
  };
  "search": {
    placeholder?: string;
    options?: readonly string[];
    optionsSource?: string;
  };
  "switch": {
    disabledWhen?: string
  };
  "structured-preview": {
    emptyLabel?: string
  };
  "table": {
    emptyLabel?: string
  };
  "permission-table": {
    addButtonLabel?: string;
    removeButtonLabel?: string;
    rowFields?: readonly DriverRowFieldOptions[];
  };
  "validation-report": {
    emptyLabel?: string
  };
  "resolver-preview": {
    inputLabel?: string;
    placeholder?: string
  };
  "search-multiselect": {
    placeholder?: string;
    addRowLabel?: string;
    emptyLabel?: string;
    options?: readonly string[];
    optionsSource?: string;
  };
  "search-optional": {
    placeholder?: string;
    emptyLabel?: string;
    options?: readonly string[];
    optionsSource?: string;
  };
  "prefix-table": {
    addRowLabel?: string;
    rowFields?: readonly DriverRowFieldOptions[];
  };
  "parameter-list": {
    emptyLabel?: string
  };
  "relationship-table": {
    emptyLabel?: string
  };
  "summary-list": {
    emptyLabel?: string
  };
  "number": {
    placeholder?: string
  };
  "activity-feed": {
    emptyLabel?: string
  };
  "version": {
    placeholder?: string;
    options?: readonly string[];
    optionsSource?: string;
  };
  "select": {
    placeholder?: string;
    options?: readonly string[];
    optionsSource?: string;
  };
  "metadata-table": {
    emptyLabel?: string
  };
}


type FieldDriver = keyof FieldDriverOptions;

type LayoutBlock<
  K extends BlockType = BlockType,
  O = Record<string, unknown>,
> = {
  type: K;
  options: O;
  children: LayoutBlock[];
};

type ValueBinding = {
  get: (record: Record<string, unknown>) => unknown;
  set?: (
    record: Record<string, unknown>,
    value: unknown,
  ) => Record<string, unknown>;
  modes: { create: boolean; update: boolean; }
};

type FieldOptionsFor<D extends FieldDriver> = {
  key: string;
  driver: D;
  binding: ValueBinding;
  docs?: {
    architecture?: string;
  };
  driverOptions?: FieldDriverOptions[D];
  // validation?: FieldDriverValidation[D];
};

type WrapOptions = {
  title?: string;
  description?: string;
  copy?: string;
  helper?: string;
  error?: (err: StoreError | ValidationError | Error) => string;
};

type SectionOptions = {
  title?: string;
  copy?: string;
};

type CardOptions = {
  title?: string;
  description?: string;
  width?: Width;
  layout?: LayoutMode;
  headerField?: FieldOptions;
  disabledWhenHeaderOff?: boolean;
};

type SidebarOptions = {
  title: string;
};

type PageColumn = {
  key: string;
  label: string;
  width?: number;
};

type PageOptions = {
  id: string;
  title: string;
  createLabel?: string;
  eyebrow?: string;
  description?: string;
  columns?: readonly PageColumn[];
};

type FieldOptions = { [D in FieldDriver]: FieldOptionsFor<D> }[FieldDriver];

const block = <K extends BlockType, O>(type: K, options: O, children: LayoutBlock[] = []): LayoutBlock<K, O> => ({ type, options, children });
const page = (options: PageOptions, children: LayoutBlock[] = []) => block("page", options, children);
const section = (options: SectionOptions, children: LayoutBlock[] = []) => block("section", options, children);
const card = (options: CardOptions, children: LayoutBlock[] = []) => block("card", options, children);
const sidebar = (options: SidebarOptions, children: LayoutBlock[] = []) => block("sidebar", options, children);
const field = (options: FieldOptions, children: LayoutBlock[] = []) => block("field", options, children);
const wrap = (options: WrapOptions, children: LayoutBlock[] = []) => block("wrap", options, children);

const bindValue = (key: string, modes = { create: true, update: true }): ValueBinding => ({
  get: (record) => record[key],
  set: (record, value) => ({ ...record, [key]: value }),
  modes,
});

const readonlyValue = (key: string) => bindValue(key, { create: false, update: false });
const bindCreateValue = (key: string) => bindValue(key, { create: true, update: false });
const readonlyRecord = (): ValueBinding => ({
  get: (record) => record,
  set: (record) => record,
  modes: { create: false, update: false }
});

export const layout = {
  wikis: page({
    id: "wikis",
    title: "Wikis",
    createLabel: "Create wiki",
    eyebrow: "Your thoughts",
    description: "Final wiki instances built from a template plus per-wiki customizations.",
    columns: [
      { key: "slug", label: "Slug", width: 2 },
      { key: "displayName", label: "Display name", width: 2 },
      { key: "templateName", label: "Template" },
      { key: "defaultWritableBag", label: "Default bag" },
      { key: "prefixRuleCount", label: "Prefix rules" },
      { key: "readonlyBagCount", label: "Readonly bags" },
      { key: "pluginCount", label: "Plugins" },
    ],
  }, [
    section({}, [
      card({
        title: "Basic Info",
        width: "full",
        layout: "stack",
      }, [
        wrap({ title: "Slug" }, [
          field({
            key: "slug",
            driver: "string",
            binding: bindValue("slug"),
          }),
        ]),
        wrap({ title: "Display name" }, [
          field({
            key: "displayName",
            driver: "string",
            binding: bindValue("displayName"),
          }),
        ]),
        wrap({ title: "Description" }, [
          field({
            key: "description",
            driver: "text",
            binding: bindValue("description"),
          }),
        ]),
        wrap({ title: "Template" }, [
          field({
            key: "templateName",
            driver: "search",
            binding: bindCreateValue("templateName"),
            driverOptions: {
              placeholder: "Template",
              optionsSource: "templates.name",
            },
          }),
        ]),
      ]),
      card({
        title: "Writable bags",
        description: "Tiddlers are written to and read from the longest matching prefix; unmatched titles use the default bag.",
        width: "full",
      }, [
        field({
          key: "writablePrefixBags",
          driver: "prefix-table",
          binding: bindValue("writablePrefixBags"),
          docs: {
            architecture: "Edits the wiki-level prefix-to-bag routing table that drives write target selection. Longest prefix wins, and the empty string row is the fallback write target. A tiddler will only be read from the single write target it matches, after that the readonly bags are used, other write targets are ignored.",
          },
          driverOptions: {
            addRowLabel: "Add prefix rule",
            rowFields: [
              {
                key: "prefix",
                placeholder: "Prefix, leave blank for default",
              }, {
                key: "bagName",
                placeholder: "Target bag",
                optionsSource: "availableBagNames",
              },
            ],
          },
        }),
      ]),
      card({
        title: "Readonly bags",
        description: "Checked when the tiddler is not in the writable bag matching the prefix.",
        width: "half",
      }, [
        field({
          key: "readonlyBags",
          driver: "search-multiselect",
          binding: bindValue("readonlyBags"),
          driverOptions: {
            placeholder: "Bag name",
            addRowLabel: "Add Bag name",
            optionsSource: "availableBagNames",
          },
        }),
      ]),
      card({
        title: "Plugins",
        description: "Add wiki-specific plugins on top of the template plugin set.",
        width: "half",
      }, [
        field({
          key: "plugins",
          driver: "search-multiselect",
          binding: bindValue("plugins"),
          driverOptions: {
            placeholder: "Plugin name",
            addRowLabel: "Add Plugin name",
            optionsSource: "availablePluginNames",
          },
        }),
      ]),
      card({
        title: "Recipe Users",
        description: "Users able to open this wiki, assuming they have read permission on every bag as well.",
        width: "half",
      }, [
        field({
          key: "recipeUsers",
          driver: "search-multiselect",
          binding: bindValue("recipeUsers"),
          docs: {
            architecture: "Edits permission rows on the wiki definition itself. These govern access to the wiki surface separately from bag-level read and write rights.",
          },
          driverOptions: {
            placeholder: "Role name",
            addRowLabel: "Add Role name",
            optionsSource: "roles.name",
          },
        }),
      ]),
      card({
        title: "Recipe Admins",
        description: "Users able to make changes on this page.",
        width: "half",
      }, [
        field({
          key: "recipeAdmins",
          driver: "search-multiselect",
          binding: bindValue("recipeAdmins"),
          docs: {
            architecture: "Edits permission rows on the wiki definition itself. These govern access to the wiki surface separately from bag-level read and write rights.",
          },
          driverOptions: {
            placeholder: "Role name",
            addRowLabel: "Add Role name",
            optionsSource: "roles.name",
          },
        }),
      ]),
    ]),
    section({
      title: "Operations and diagnostics",
    }, [
      card({
        title: "Title routing test",
        description: "Test a title against the wiki's current prefix rules to see which bag would receive writes.",
        width: "full",
      }, [
        field({
          key: "titleResolutionPreview",
          driver: "resolver-preview",
          binding: readonlyRecord(),
          docs: {
            architecture: "Diagnostic resolver output for a title entered by the user: computed prefix match and authored write target selection only. Read answers and final write permission would require live server state.",
          },
          driverOptions: { inputLabel: "Title to test" },
        }),
      ]),
    ]),
    sidebar({ title: "Sidebar" }, [
      wrap({ title: "Display name" }, [
        field({
          key: "displayName",
          driver: "string",
          binding: readonlyValue("displayName"),
        }),
      ]),
      wrap({ title: "Slug" }, [
        field({
          key: "slug",
          driver: "string",
          binding: readonlyValue("slug"),
        }),
      ]),
      wrap({ title: "Template" }, [
        field({
          key: "templateName",
          driver: "search",
          binding: readonlyValue("templateName"),
        }),
      ]),
      wrap({ title: "Current writable bags" }, [
        field({
          key: "effectiveWritableBags",
          driver: "prefix-table",
          binding: readonlyValue("effectiveWritableBags"),
        }),
      ]),
      wrap({ title: "Current readonly bags" }, [
        field({
          key: "effectiveReadonlyBags",
          driver: "table",
          binding: readonlyValue("effectiveReadonlyBags"),
        }),
      ]),
      wrap({ title: "Current plugin set" }, [
        field({
          key: "effectivePluginSet",
          driver: "table",
          binding: readonlyValue("effectivePluginSet"),
        }),
      ]),
    ]),
  ]),
  templates: page({
    id: "templates",
    title: "Templates",
    createLabel: "Create template",
    eyebrow: "Wiki Blueprints",
    description: "Reusable recipe definitions. Changes made to a template apply to every wiki using it.",
    columns: [
      { key: "name", label: "Name", width: 2 },
      { key: "description", label: "Description", width: 3 },
      { key: "readonlyBagsSummary", label: "Readonly bags" },
      { key: "dependentWikiCount", label: "Dependent wikis" },
      { key: "lastUpdatedAt", label: "Updated", width: 2 },
    ],
  }, [
    section({}, [
      card({
        title: "Template basics",
        width: "full",
        layout: "stack",
      }, [
        wrap({ title: "Name" }, [
          field({
            key: "name",
            driver: "string",
            binding: bindValue("name"),
          }),
        ]),
        wrap({ title: "Description" }, [
          field({
            key: "description",
            driver: "text",
            binding: bindValue("description"),
          }),
        ]),
        wrap({
          title: "TiddlyWiki Version",
          description: "TW5 version pinning. Leave blank to use site default.",
        }, [
          field({
            key: "twVersion",
            driver: "search-optional",
            binding: bindValue("twVersion"),
            driverOptions: {
              placeholder: "TiddlyWiki Version",
              optionsSource: "embeddedServerResponse.tw5Versions",
              emptyLabel: "Leave blank to use site default.",
            },
          }),
        ]),
      ]),
      card({
        title: "Writable routing",
        description: "Set the title prefix for each bag you want to write to. Tiddlers are only read from the bag matching the prefix. ",
        width: "full",
      }, [
        field({
          key: "writablePrefixBags",
          driver: "prefix-table",
          binding: bindValue("writablePrefixBags"),
          docs: {
            architecture: "Edits the template-level prefix-to-bag routing table that wikis inherit first. Longest prefix wins, and the empty string row is the fallback write target when no wiki-level override matches. Define the write targets for title prefixes. The resolver matches prefixes from longest to shortest, so most specific prefix gets the tiddler. A tiddler will first be read from the single writable bag it matches, then from readonly bags, other writable bags are ignored. The default bag catches any titles that don't match a prefix. ",
          },
          driverOptions: {
            addRowLabel: "Add prefix rule",
            rowFields: [
              {
                key: "prefix",
                placeholder: "Prefix, leave blank for default",
              }, {
                key: "bagName",
                placeholder: "Target bag",
                optionsSource: "availableBagNames",
              },
            ],
          },
        }),
      ]),
      card({ title: "Bags", width: "half" }, [
        field({
          key: "readonlyBags",
          driver: "search-multiselect",
          binding: bindValue("readonlyBags"),
          driverOptions: {
            placeholder: "Bag name",
            addRowLabel: "Add Bag name",
            optionsSource: "availableBagNames",
          },
        }),
      ]),
      card({
        title: "Plugins",
        width: "half",
        layout: "stack",
      }, [
        wrap({ title: "Plugin name" }, [
          field({
            key: "plugins",
            driver: "search-multiselect",
            binding: bindValue("plugins"),
            driverOptions: {
              placeholder: "Plugin name",
              addRowLabel: "Add Plugin name",
              optionsSource: "availablePluginNames",
            },
          }),
        ]),
        wrap({
          title: "Include Required Plugins",
          description: "Core plugins enable wiki sync functionality. Disabling removes the plugins, but does not disable the endpoints.",
        }, [
          field({
            key: "requiredPluginsEnabled",
            driver: "switch",
            binding: bindValue("requiredPluginsEnabled"),
          }),
        ]),
        wrap({
          title: "Enable Plugin Caching",
          description: "Serves plugins separately, allowing the browser to cache plugins separate from the store.",
        }, [
          field({
            key: "externalPlugins",
            driver: "switch",
            binding: bindValue("externalPlugins"),
          }),
        ]),
        wrap({
          title: "External JS Store",
          description: "Loads the entire store, including plugins, via a script tag.",
        }, [
          field({
            key: "externalStore",
            driver: "switch",
            binding: bindValue("externalStore"),
          }),
        ]),
      ]),
      card({
        title: "Template Users",
        description: "Users who can set this template on a recipe. This only applies to the user creating the recipe.",
        width: "half",
      }, [
        field({
          key: "templateUsers",
          driver: "search-multiselect",
          binding: bindValue("templateUsers"),
          docs: {
            architecture: "Edits permission rows on the wiki definition itself. These govern access to the wiki surface separately from bag-level read and write rights.",
          },
          driverOptions: {
            placeholder: "Role name",
            addRowLabel: "Add Role name",
            optionsSource: "roles.name",
          },
        }),
      ]),
      card({
        title: "Template Admins",
        description: "Users able to make changes on this page. This affects all recipes that use the template, regardless of any other permissions.",
        width: "half",
      }, [
        field({
          key: "templateAdmins",
          driver: "search-multiselect",
          binding: bindValue("templateAdmins"),
          docs: {
            architecture: "Edits permission rows on the wiki definition itself. These govern access to the wiki surface separately from bag-level read and write rights.",
          },
          driverOptions: {
            placeholder: "Role name",
            addRowLabel: "Add Role name",
            optionsSource: "roles.name",
          },
        }),
      ]),
      card({
        title: "Custom HTML shell",
        description: "Enable custom HTML shell settings when this template should serve authored HTML instead of the default page shell.",
        width: "full",
        layout: "stack",
        headerField: {
          key: "customHtmlEnabled",
          driver: "switch",
          binding: bindValue("customHtmlEnabled"),
        },
        disabledWhenHeaderOff: true,
      }, [
        wrap({
          title: "HTML content",
          description: "Store the raw HTML that will be served for this template. All HTTP endpoints still work, but any boot, library, or raw markup tiddlers must be included here manually.",
        }, [
          field({
            key: "htmlContent",
            driver: "text",
            binding: bindValue("htmlContent"),
            driverOptions: { disabledWhen: "!customHtmlEnabled" },
          }),
        ]),
        wrap({
          title: "Injection function",
          description: "Name of the JavaScript function to call with each tiddler, for example $tw.preloadTiddler.",
        }, [
          field({
            key: "injectionFunction",
            driver: "string",
            binding: bindValue("injectionFunction"),
            driverOptions: { disabledWhen: "!customHtmlEnabled" },
          }),
        ]),
        wrap({
          title: "Injection marker",
          description: "Inject the tiddlers before this string in the HTML file, for example <!-- INJECT STORE TIDDLERS HERE -->. It must not be inside a script tag.",
        }, [
          field({
            key: "injectionLocation",
            driver: "string",
            binding: bindValue("injectionLocation"),
            driverOptions: { disabledWhen: "!customHtmlEnabled" },
          }),
        ]),
      ]),
    ]),
    sidebar({ title: "Sidebar" }, [
      wrap({ title: "Name" }, [
        field({
          key: "name",
          driver: "string",
          binding: readonlyValue("name"),
        }),
      ]),
      wrap({ title: "Description" }, [
        field({
          key: "description",
          driver: "text",
          binding: readonlyValue("description"),
        }),
      ]),
      wrap({ title: "Dependent wikis" }, [
        field({
          key: "dependentWikiCount",
          driver: "number",
          binding: readonlyValue("dependentWikiCount"),
        }),
      ]),
    ]),
  ]),
  bags: page({
    id: "bags",
    title: "Bags",
    createLabel: "Create bag",
    eyebrow: "Tiddler Storage",
    description: "Concrete tiddler storage with role-based access control.",
    columns: [
      { key: "name", label: "Name", width: 2 },
      { key: "description", label: "Description", width: 2 },
      { key: "usedByCount", label: "Used by" },
      { key: "readonlyUsageCount", label: "Readonly" },
      { key: "writableUsageCount", label: "Writable" },
      { key: "defaultUsageCount", label: "Default" },
      { key: "permissionSummary", label: "Permissions" },
    ],
  }, [
    section({}, [
      card({
        title: "Bag basics",
        width: "full",
        layout: "stack",
      }, [
        wrap({ title: "Name" }, [
          field({
            key: "name",
            driver: "string",
            binding: bindValue("name"),
          }),
        ]),
        wrap({ title: "Description" }, [
          field({
            key: "description",
            driver: "text",
            binding: bindValue("description"),
          }),
        ]),
      ]),
      card({ title: "Permissions", width: "full" }, [
        field({
          key: "bagPermissions",
          driver: "permission-table",
          binding: bindValue("bagPermissions"),
          docs: {
            architecture: "Edits bag permission rows. These rows are consulted directly by the resolver when deciding who can read from or write to the storage container.",
          },
          driverOptions: {
            addButtonLabel: "Add permission",
            removeButtonLabel: "Remove",
            rowFields: [
              {
                key: "role",
                placeholder: "Role",
                optionsSource: "roles.name",
              },
              { key: "level", options: ["A_read", "B_write", "C_admin"] },
            ],
          },
        }),
      ]),
    ]),
    section({
      title: "Current server state",
      copy: "These values come from the current server state. Changes you make on this page are not reflected here until you click save.",
    }, [
      card({ title: "Referenced by templates", width: "half" }, [
        field({
          key: "referencedByTemplates",
          driver: "relationship-table",
          binding: readonlyValue("referencedByTemplates"),
          docs: {
            architecture: "Read-only relationship view derived from authored template definition JSON that mentions this bag in readonly or writable routing positions.",
          },
        }),
      ]),
      card({ title: "Referenced by wikis", width: "half" }, [
        field({
          key: "referencedByWikis",
          driver: "relationship-table",
          binding: readonlyValue("referencedByWikis"),
          docs: {
            architecture: "Read-only relationship view derived from compiled recipe-bag rows, reflecting the effective runtime routing topology.",
          },
        }),
      ]),
    ]),
    sidebar({ title: "Sidebar" }, [
      wrap({ title: "Name" }, [
        field({
          key: "name",
          driver: "string",
          binding: readonlyValue("name"),
        }),
      ]),
      wrap({ title: "Description" }, [
        field({
          key: "description",
          driver: "text",
          binding: readonlyValue("description"),
        }),
      ]),
      wrap({ title: "Referenced by templates" }, [
        field({
          key: "referencedByTemplates",
          driver: "relationship-table",
          binding: readonlyValue("referencedByTemplates"),
        }),
      ]),
      wrap({ title: "Referenced by wikis" }, [
        field({
          key: "referencedByWikis",
          driver: "relationship-table",
          binding: readonlyValue("referencedByWikis"),
        }),
      ]),
    ]),
  ]),
  roles: page({
    id: "roles",
    title: "Roles",
    createLabel: "Create role",
    eyebrow: "Access profiles",
    description: "Named access profiles that can be assigned to user accounts.",
    columns: [
      { key: "name", label: "Role name", width: 2 },
      { key: "description", label: "Role description", width: 7 },
    ],
  }, [
    section({}, [
      card({
        title: "Role basics",
        width: "full",
        layout: "stack",
      }, [
        wrap({ title: "Role name" }, [
          field({
            key: "name",
            driver: "string",
            binding: bindValue("name"),
          }),
        ]),
        wrap({ title: "Role description" }, [
          field({
            key: "description",
            driver: "text",
            binding: bindValue("description"),
          }),
        ]),
      ]),
    ]),
    sidebar({ title: "Sidebar" }, [
      wrap({ title: "Role name" }, [
        field({
          key: "name",
          driver: "string",
          binding: readonlyValue("name"),
        }),
      ]),
      wrap({ title: "Role description" }, [
        field({
          key: "description",
          driver: "text",
          binding: readonlyValue("description"),
        }),
      ]),
    ]),
  ]),
  users: page({
    id: "users",
    title: "Users",
    createLabel: "Create user",
    eyebrow: "Account logins",
    description: "User accounts with assigned roles.",
    columns: [
      { key: "username", label: "Username", width: 2 },
      { key: "email", label: "Email", width: 7 },
    ],
  }, [
    section({}, [
      card({
        title: "User identity",
        width: "full",
        layout: "stack",
      }, [
        wrap({ title: "Username" }, [
          field({
            key: "username",
            driver: "string",
            binding: bindValue("username"),
          }),
        ]),
        wrap({ title: "Email" }, [
          field({
            key: "email",
            driver: "string",
            binding: bindValue("email"),
          }),
        ]),
      ]),
      card({
        title: "Roles",
        description: "Assign one or more role ids to this user account.",
        width: "half",
      }, [
        field({
          key: "userRoles",
          driver: "search-multiselect",
          binding: bindValue("userRoles"),
          driverOptions: {
            placeholder: "Roles",
            addRowLabel: "Add Roles",
            optionsSource: "roles.name",
          },
        }),
      ]),
      card({
        title: "Reset Code",
        description: "Allow the user to reset their password with this code.",
        width: "half",
      }, [
        field({
          key: "resetCode",
          driver: "string",
          binding: bindValue("resetCode"),
        }),
      ]),
    ]),
    sidebar({ title: "Sidebar" }, [
      wrap({ title: "Username" }, [
        field({
          key: "username",
          driver: "string",
          binding: readonlyValue("username"),
        }),
      ]),
      wrap({ title: "Email" }, [
        field({
          key: "email",
          driver: "string",
          binding: readonlyValue("email"),
        }),
      ]),
      wrap({ title: "Roles" }, [
        field({
          key: "userRoles",
          driver: "search-multiselect",
          binding: readonlyValue("userRoles"),
        }),
      ]),
    ]),
  ]),
} as const;
