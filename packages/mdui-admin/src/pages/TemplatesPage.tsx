import { customElement, state } from "lit/decorators.js";
import { JSXElement } from '../utils/JSXElement';
import { PopupContainer } from '../components/mdui-popup';
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";
import { FormState, FormsComp } from '../utils/forms';
import { createKVStore } from "../utils/indexeddb";
import { addstyles } from "../utils/addstyles";

declare global {
  interface CustomElements {
    'mws-templates-page': JSX.SimpleAttrs<{}, TemplatesPage>;
  }
}

type TemplateType = 'basic' | 'advanced';

interface BasicTemplate {
  type: 'basic';
  name: string;
  description: string;
  bags: string[];
  plugins: string[];
  requiredPluginsEnabled: boolean;
}

interface AdvancedTemplate {
  type: 'advanced';
  name: string;
  description: string;
  htmlFile: File | null;
  htmlContent: string;
  injectionArray: string;
  injectionLocation: string;
}

@customElement("mws-templates-page")
export class TemplatesPage extends JSXElement {
  @state() accessor showNewTemplatePopup = false;
  @state() accessor savedTemplates: (BasicTemplate | AdvancedTemplate)[] = [];
  @state() accessor isCreatingNew = true;

  kvstore = createKVStore({
    dbName: 'mws-templates',
    storeName: 'templates',
    version: 1,
  });

  async connectedCallback() {
    super.connectedCallback();
    this.forms.events.on('change', this._onFormsChange);
    await this.loadTemplates();
  }

  async loadTemplates() {
    try {
      await this.kvstore.open();
      const templates: (BasicTemplate | AdvancedTemplate)[] = [];
      await this.kvstore.openCursor(null, 'next', (cursor) => {
        if (cursor) {
          templates.push(cursor.value);
          cursor.continue();
        }
      });
      this.savedTemplates = templates;
      await this.kvstore.close();
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  private newTemplateButton = createHybridRef<HTMLElement>();
  private popup = createHybridRef<PopupContainer>();

  private availableBags = ['main-bag', 'blog-bag', 'docs-bag', 'system-bag', 'plugins-bag'];
  private availablePlugins = ['markdown', 'codemirror', 'highlight', 'katex', 'plugins/tiddlywiki/filesystem'];

  private forms = new FormState({
    templateName: FormState.TextField({
      label: 'Template Name',
      required: true,
      default: '',
      valid: (v) => !v?.trim() ? 'Template name is required' : undefined,
    }),
    templateDescription: FormState.TextArea({
      label: 'Description',
      default: '',
    }),
    selectedTemplateType: FormState.RadioGroup({
      label: 'Template Type',
      options: [
        { value: 'basic', label: 'Basic' },
        { value: 'advanced', label: 'Advanced' },
      ],
      default: 'basic',
      active: () => this.isCreatingNew,
    }),
    modeExplanation: FormState.CustomRender(
      (values) => (
        <div style="padding: 16px; background-color: var(--mdui-color-surface-container); border-radius: 8px; color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
          {values.selectedTemplateType === 'basic' ? (
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
      { active: () => this.isCreatingNew }
    ),
    bags: FormState.MultiSelect({
      label: 'Bags',
      suggestions: this.availableBags,
      default: [],
      active: () => !this.isCreatingNew,
      valid: (v) => !v?.length ? 'At least one bag is required' : undefined,
    }),
    plugins: FormState.MultiSelect({
      label: 'Client Plugins',
      suggestions: this.availablePlugins,
      default: [],
      active: (values) => !this.isCreatingNew && values.selectedTemplateType === 'basic',
    }),
    requiredPluginsEnabled: FormState.Switch({
      label: 'Required Plugins',
      description: 'Core plugins enable wiki sync functionality. Disable for vanilla wikis or custom sync implementations.',
      default: true,
      active: (values) => !this.isCreatingNew && values.selectedTemplateType === 'basic',
    }),
    htmlFile: FormState.FileUpload({
      label: 'Custom HTML File',
      accept: '.html,.htm',
      helperText: 'Upload a static HTML file to use as the wiki base. This allows you to completely replace the wiki page with a custom one, including raw markup, old versions of core, or even a completely different wiki.',
      default: null,
      active: (values) => !this.isCreatingNew && values.selectedTemplateType === 'advanced',
      onFileChange: async (file) => {
        if (file) this.forms.setValue('htmlContent', await this.parseHtmlFile(file));
      },
    }),
    htmlContent: FormState.TextField({
      label: '',
      default: '',
      active: () => false,
    }),
    injectionArray: FormState.TextField({
      label: 'Injection Array',
      required: true,
      default: '$tw.preloadTiddlers',
      helperText: 'Name of the JavaScript array to push tiddlers onto (e.g., $tw.preloadTiddlers)',
      active: (values) => !this.isCreatingNew && values.selectedTemplateType === 'advanced',
      valid: (v) => !v?.trim() ? 'Injection array is required' : undefined,
    }),
    injectionLocation: FormState.TextField({
      label: 'Injection Location',
      required: true,
      default: '',
      helperText: 'Inject the tiddlers BEFORE this string in the HTML file. MUST NOT be inside a script tag! (e.g., <!-- INJECT STORE TIDDLERS HERE -->)',
      active: (values) => !this.isCreatingNew && values.selectedTemplateType === 'advanced',
      valid: (v) => !v?.trim() ? 'Injection location is required' : undefined,
    }),
    advancedNote: FormState.CustomRender(
      () => (
        <div style="color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
          All HTTP endpoints will still work, and the store tiddlers and recipe plugins will be
          added at the injection location. Boot, library, and raw markup tiddlers are not read
          from store and must be included in the HTML manually.
        </div>
      ),
      { active: (values) => !this.isCreatingNew && values.selectedTemplateType === 'advanced' }
    ),
  }, {
    onCancel: () => this.closePopup(),
    onSubmit: async (values) => {
      if (this.isCreatingNew) {
        this.isCreatingNew = false;
      } else {
        await this.doSave(values);
      }
    },
    submitLabel: () => this.isCreatingNew ? 'Continue' : 'Save',
  });

  private parseHtmlFile(file: File): Promise<string> {
    return file.text();
  }

  private closePopup = () => {
    this.popup.current?.close(() => {
      this.showNewTemplatePopup = false;
      this.forms.resetValues();
      this.isCreatingNew = true;
    });
  };

  private loadTemplateForEdit = (template: BasicTemplate | AdvancedTemplate) => {
    if (template.type === 'basic') {
      this.forms.setValues({
        templateName: template.name,
        templateDescription: template.description,
        selectedTemplateType: 'basic',
        bags: template.bags,
        plugins: template.plugins,
        requiredPluginsEnabled: template.requiredPluginsEnabled,
        htmlFile: null,
        htmlContent: '',
        injectionArray: '$tw.preloadTiddlers',
        injectionLocation: '',
      });
    } else {
      this.forms.setValues({
        templateName: template.name,
        templateDescription: template.description,
        selectedTemplateType: 'advanced',
        bags: [],
        plugins: [],
        requiredPluginsEnabled: true,
        htmlFile: template.htmlFile,
        htmlContent: template.htmlContent,
        injectionArray: template.injectionArray,
        injectionLocation: template.injectionLocation,
      });
    }
    this.forms.setErrors({});
    this.isCreatingNew = false;
    this.showNewTemplatePopup = true;
  };

  private doSave = async (values: Record<string, any>) => {
    try {
      await this.kvstore.open();
      if (values.selectedTemplateType === 'basic') {
        const template: BasicTemplate = {
          type: 'basic',
          name: values.templateName,
          description: values.templateDescription,
          bags: (values.bags as string[]).filter((b: string) => b.trim()),
          plugins: (values.plugins as string[]).filter((p: string) => p.trim()),
          requiredPluginsEnabled: values.requiredPluginsEnabled,
        };
        await this.kvstore.set(values.templateName, template);
      } else {
        const template: AdvancedTemplate = {
          type: 'advanced',
          name: values.templateName,
          description: values.templateDescription,
          htmlFile: values.htmlFile,
          htmlContent: values.htmlContent,
          injectionArray: values.injectionArray,
          injectionLocation: values.injectionLocation,
        };
        await this.kvstore.set(values.templateName, template);
      }
      await this.kvstore.close();
      await this.loadTemplates();
      this.closePopup();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
      await this.kvstore.close();
    }
  };

  private _onFormsChange = () => this.requestUpdate();

  disconnectedCallback() {
    super.disconnectedCallback();
    this.forms.events.off('change', this._onFormsChange);
  }

  private renderTemplateListItem(template: BasicTemplate | AdvancedTemplate) {
    const icon = template.type === 'basic' ? 'dashboard' : 'code';
    let description = '';
    if (template.type === 'basic') {
      const bagCount = template.bags.length;
      const pluginCount = template.plugins.length;
      description = `Basic · ${bagCount} bag${bagCount !== 1 ? 's' : ''}, ${pluginCount} plugin${pluginCount !== 1 ? 's' : ''}`;
    } else {
      description = 'Advanced · Custom HTML with injection';
    }
    return (
      <mdui-list-item onclick={() => this.loadTemplateForEdit(template)}>
        <mdui-icon webjsx-attr-slot="icon" name={icon}></mdui-icon>
        {template.name}
        <div webjsx-attr-slot="description">{description}</div>
      </mdui-list-item>
    );
  }

  protected render() {
    const formTitle = this.isCreatingNew ? 'Create New Template' : 'Configure Template';
    const submitLabel = this.forms?.submitLabel ?? 'Save';
    const cancelLabel = this.forms?.cancelLabel ?? 'Cancel';
    const title = formTitle ?? this.forms?.options?.title;
    return (
      <div class="page-content">
        <mdui-card variant="outlined" style="margin: 16px;">
          <div style="padding: 24px;">
            <div style="margin-bottom: 16px; font-size: 28px; font-weight: 400; line-height: 36px;">
              Templates
            </div>
            <div style="margin-bottom: 24px; color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
              Templates define the structure and features of wikis. They combine bags, plugins, and configuration.
            </div>

            {this.savedTemplates.length > 0 ? (
              <mdui-list>
                {this.savedTemplates.map(template => this.renderTemplateListItem(template))}
              </mdui-list>
            ) : (
              <div style="padding: 24px; text-align: center; color: var(--mdui-color-on-surface-variant); font-size: 14px; line-height: 20px;">
                No templates yet. Click "New Template" to create one.
              </div>
            )}

            <mdui-button
              ref={this.newTemplateButton}
              variant="filled"
              style="margin-top: 16px;"
              icon="add"
              onclick={() => { this.showNewTemplatePopup = true; }}
            >
              New Template
            </mdui-button>
          </div>
        </mdui-card>

        {this.showNewTemplatePopup && (
          <PopupContainer
            ref={this.popup}
            source={this.newTemplateButton.current}
            cardStyle="max-width: 80vw; max-height: 80vh;"
            oncancel={this.closePopup}
          >
            <mdui-forms-popup>
              <display-content slot="title">
                {title}
              </display-content>
              <display-content slot="fields">
                <FormsComp state={this.forms}>
                  {this.forms.renderSlots()}
                </FormsComp>
              </display-content>
              <display-content slot="actions">
                <mdui-button variant="text" onclick={() => this.forms?.options?.onCancel?.()}>
                  {cancelLabel}
                </mdui-button>
                <mdui-button variant="filled" onclick={() => this.forms?.handleSubmit()}>
                  {submitLabel}
                </mdui-button>
              </display-content>
            </mdui-forms-popup>
          </PopupContainer>
        )}
      </div>
    );
  }
}
