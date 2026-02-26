import { customElement, state } from "lit/decorators.js";
import { map, Subscription } from 'rxjs';
import { JSXElement } from '../utils/JSXElement';
import { PopupContainer } from '../components/mdui-popup';
import { createHybridRef, HybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";
import { FormMaker, FormState, FormsComp, ItemStorePage } from '../utils/forms';
import { dataService, DataStore, Template } from '../services/data.service';

export function createTemplatesFormState(this: ItemStorePage<Template, { isCreatingNew: boolean }>) {
  return new FormState((F: FormMaker<Template>) => ({
    name: F.TextField({
      label: 'Template Name',
      required: true,
      default: '',
      valid: (v) => !v?.trim() ? 'Template name is required' : undefined,
    }),
    description: F.TextArea({
      label: 'Description',
      default: '',
    }),
    type: F.RadioGroup({
      label: 'Template Type',
      options: [
        { value: 'basic', label: 'Basic' },
        { value: 'advanced', label: 'Advanced' },
      ],
      default: 'basic',
      active: () => this.state.isCreatingNew,
    }),
    modeExplanation: F.CustomRender(
      (values) => (
        <div style="padding: 16px; background-color: var(--mdui-color-surface-container); border-radius: 8px; color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
          {values.type === 'basic' ? (
            <>
              <div style="margin-bottom: 8px; font-weight: 500; color: var(--mdui-color-on-surface);">Basic Mode</div>
              <div>Define wikis using bags and plugins. The system generates the HTML and manages all server-side operations.</div>
            </>
          ) : (
            <>
              <div style="margin-bottom: 8px; font-weight: 500; color: var(--mdui-color-on-surface);">Advanced Mode</div>
              <div>Upload a custom HTML file and inject tiddlers at a specific location. Useful for custom wiki builds, old TiddlyWiki versions, or completely custom implementations.</div>
            </>
          )}
        </div>
      ),
      { active: () => this.state.isCreatingNew }
    ),
    bags: F.MultiSelect({
      label: 'Bags',
      suggestions: dataService.bags.changes$.pipe(
        map(bags => bags.map(b => ({ value: b.name, label: b.name })))),
      default: [],
      active: () => !this.state.isCreatingNew,
      valid: (v) => undefined, //!v?.length ? 'At least one bag is required' : undefined,
    }),
    plugins: F.MultiSelect({
      label: 'Client Plugins',
      suggestions: dataService.plugins.changes$.pipe(map(plugins =>
        plugins.map(p => ({ value: p.path, label: p.path }))
      )),
      default: [],
      active: (values: Template) => !this.state.isCreatingNew && values.type === 'basic',
    }),
    requiredPluginsEnabled: F.Switch({
      label: 'Required Plugins',
      description: 'Core plugins enable wiki sync functionality. Disable for vanilla wikis or custom sync implementations.',
      default: true,
      active: (values: Template) => !this.state.isCreatingNew && values.type === 'basic',
    }),
    htmlFile: F.FileUpload({
      label: 'Custom HTML File',
      accept: '.html,.htm',
      helperText: 'Upload a static HTML file to use as the wiki base. This allows you to completely replace the wiki page with a custom one, including raw markup, old versions of core, or even a completely different wiki.',
      default: null,
      active: (values: Template) => !this.state.isCreatingNew && values.type === 'advanced',
      onFileChange: async (file) => {
        if (file) this.forms.setValue('htmlContent', await file.text());
      },
    }),
    htmlContent: F.TextField({
      label: '',
      default: '',
      active: () => false,
    }),
    injectionArray: F.TextField({
      label: 'Injection Array',
      required: true,
      default: '$tw.preloadTiddlers',
      helperText: 'Name of the JavaScript array to push tiddlers onto (e.g., $tw.preloadTiddlers)',
      active: (values: Template) => !this.state.isCreatingNew && values.type === 'advanced',
      valid: (v) => !v?.trim() ? 'Injection array is required' : undefined,
    }),
    injectionLocation: F.TextField({
      label: 'Injection Location',
      required: true,
      default: '',
      helperText: 'Inject the tiddlers BEFORE this string in the HTML file. MUST NOT be inside a script tag! (e.g., <!-- INJECT STORE TIDDLERS HERE -->)',
      active: (values: Template) => !this.state.isCreatingNew && values.type === 'advanced',
      valid: (v) => !v?.trim() ? 'Injection location is required' : undefined,
    }),
    advancedNote: F.CustomRender(
      () => (
        <div style="color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
          All HTTP endpoints will still work, and the store tiddlers and recipe plugins will be
          added at the injection location. Boot, library, and raw markup tiddlers are not read
          from store and must be included in the HTML manually.
        </div>
      ),
      { active: (values: Template) => !this.state.isCreatingNew && values.type === 'advanced' }
    ),
  }), {
    store: dataService.templates,
    idKey: 'name',
    onInit: (item?: Template) => {
      this.state = { isCreatingNew: !item };
    },
    onCancel: () => this.closePopup(),
    onSubmit: async (values) => {
      if (this.state.isCreatingNew) {
        this.state = { isCreatingNew: false };
      } else {
        await this.doSave(values);
      }
    },
    submitLabel: () => this.state.isCreatingNew ? 'Continue' : 'Save',
    formTitle: () => this.state.isCreatingNew ? 'Create New Template' : 'Configure Template',
    listTitle: "Templates",
    listDescription: <>
      Templates define the structure and features of wikis. They combine bags, plugins, and configuration.
    </>,
    listEmptyText: `No templates yet. Click "New Template" to create one.`,
    createItemLabel: 'New Template',
    renderListItem: (template: Template) => {
      const icon = template.type === 'basic' ? 'dashboard' : 'code';
      let description = '';
      // console.log(template);
      if (template.type === 'basic') {
        const bagCount = template.bags.length;
        const pluginCount = template.plugins.length;
        description = `Basic · ${bagCount} bag${bagCount !== 1 ? 's' : ''}, ${pluginCount} plugin${pluginCount !== 1 ? 's' : ''}`;
      } else {
        description = 'Advanced · Custom HTML with injection';
      }
      const listref = createHybridRef<HTMLElement>();
      return (
        <mdui-list-item ref={listref} onclick={() => this.loadItemForEdit(template, listref)}>
          <mdui-icon webjsx-attr-slot="icon" name={icon}></mdui-icon>
          {template.name}
          <div webjsx-attr-slot="description">{description}</div>
        </mdui-list-item>
      );
    }
  });
}
createTemplatesFormState.tabTitle = "Templates";