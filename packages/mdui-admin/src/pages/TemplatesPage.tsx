import { customElement, state } from "lit/decorators.js";
import { JSXElement } from '../utils/JSXElement';
import { PopupContainer } from '../components/mdui-popup';
import { createHybridRef } from "@tiddlywiki/jsx-runtime/jsx-utils";
import { FormBuilder } from '../utils/forms';
import { createKVStore } from "../utils/indexeddb";

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
  skipRequiredPlugins: boolean;
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

type ErrorKey = 'templateName' | 'bags' | 'injectionArray' | 'injectionLocation';

@customElement("mws-templates-page")
export class TemplatesPage extends JSXElement {
  @state() accessor showNewTemplatePopup = false;
  @state() accessor selectedTemplateType: TemplateType = 'basic';
  @state() accessor savedTemplates: (BasicTemplate | AdvancedTemplate)[] = [];

  kvstore = createKVStore({
    dbName: 'mws-templates',
    storeName: 'templates',
    version: 1,
  })

  async connectedCallback() {
    super.connectedCallback();
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

  // Form values state
  @state() accessor formValues = {
    templateName: '',
    templateDescription: '',
    bags: [''] as string[],
    plugins: [''] as string[],
    skipRequiredPlugins: false,
    htmlFile: null as File | null,
    htmlContent: '',
    injectionArray: '$tw.preloadTiddlers',
    injectionLocation: '',
  };

  // Validation state
  @state() accessor errors: Record<string, string | undefined> = {};

  // Form builder instance
  private forms = new FormBuilder(
    () => this.formValues,
    (values) => this.formValues = values,
    () => this.errors,
    (errors) => this.errors = errors
  );

  // Available bags and plugins for autocomplete
  private availableBags = ['main-bag', 'blog-bag', 'docs-bag', 'system-bag', 'plugins-bag'];
  private availablePlugins = ['markdown', 'codemirror', 'highlight', 'katex', 'plugins/tiddlywiki/filesystem'];

  private closePopup = () => {
    this.popup.current?.close(() => {
      this.showNewTemplatePopup = false;
      this.resetForm();
    });
  };

  private resetForm = () => {
    this.formValues = {
      templateName: '',
      templateDescription: '',
      bags: [''],
      plugins: [''],
      skipRequiredPlugins: false,
      htmlFile: null,
      htmlContent: '',
      injectionArray: '$tw.preloadTiddlers',
      injectionLocation: '',
    };
    this.selectedTemplateType = 'basic';
    this.errors = {};
  };

  private validateForm = (): boolean => {
    const newErrors: Record<string, string | undefined> = {};

    // Validate template name
    if (!this.formValues.templateName.trim()) {
      newErrors.templateName = 'Template name is required';
    }

    // Validate bags - at least one non-empty bag
    const validBags = this.formValues.bags.filter(b => b.trim());
    if (validBags.length === 0) {
      newErrors.bags = 'At least one bag is required';
    }

    // Validate advanced template specific fields
    if (this.selectedTemplateType === 'advanced') {
      if (!this.formValues.injectionArray.trim()) {
        newErrors.injectionArray = 'Injection array is required';
      }
      if (!this.formValues.injectionLocation.trim()) {
        newErrors.injectionLocation = 'Injection location is required';
      }
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  private handleSave = async () => {
    if (!this.validateForm()) {
      return;
    }

    try {
      await this.kvstore.open();

      if (this.selectedTemplateType === 'basic') {
        const template: BasicTemplate = {
          type: 'basic',
          name: this.formValues.templateName,
          description: this.formValues.templateDescription,
          bags: this.formValues.bags.filter(b => b.trim()),
          plugins: this.formValues.plugins.filter(p => p.trim()),
          skipRequiredPlugins: this.formValues.skipRequiredPlugins,
        };
        await this.kvstore.set(this.formValues.templateName, template);
        console.log('Saved basic template:', template);
      } else {
        const template: AdvancedTemplate = {
          type: 'advanced',
          name: this.formValues.templateName,
          description: this.formValues.templateDescription,
          htmlFile: this.formValues.htmlFile,
          htmlContent: this.formValues.htmlContent,
          injectionArray: this.formValues.injectionArray,
          injectionLocation: this.formValues.injectionLocation,
        };
        await this.kvstore.set(this.formValues.templateName, template);
        console.log('Saved advanced template:', template);
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

  private parseHtmlFile = async (file: File): Promise<string> => {
    // TODO: Implement HTML parsing
    return file.text();
  };

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
      <mdui-list-item>
        <mdui-icon webjsx-attr-slot="icon" name={icon}></mdui-icon>
        {template.name}
        <div webjsx-attr-slot="description">{description}</div>
      </mdui-list-item>
    );
  }

  protected render() {
    return (
      <div class="page-content">
        <mdui-card variant="outlined" style="margin: 16px;">
          <div style="padding: 24px;">
            <div class="md-typescale-headline-medium" style="margin-bottom: 16px;">
              Templates
            </div>
            <div class="md-typescale-body-medium" style="margin-bottom: 24px; color: var(--mdui-color-on-surface-variant);">
              Templates define the structure and features of wikis. They combine bags, plugins, and configuration.
            </div>

            {this.savedTemplates.length > 0 ? (
              <mdui-list>
                {this.savedTemplates.map(template => this.renderTemplateListItem(template))}
              </mdui-list>
            ) : (
              <div class="md-typescale-body-medium" style="padding: 24px; text-align: center; color: var(--mdui-color-on-surface-variant);">
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

        {/* New Template Popup */}
        {this.showNewTemplatePopup && (
          <PopupContainer
            ref={this.popup}
            source={this.newTemplateButton.current}
            cardStyle="width: 600px; max-width: 90vw; max-height: 90vh; overflow-y: auto;"
            oncancel={this.closePopup}
          >
            <div style="padding: 24px;">
              {this.renderNewTemplateForm()}
            </div>
          </PopupContainer>
        )}
      </div>
    );
  }

  renderNewTemplateForm() {
    // Create a separate FormBuilder for selectedTemplateType
    const typeForm = new FormBuilder(
      () => ({ selectedTemplateType: this.selectedTemplateType }),
      (values) => this.selectedTemplateType = values.selectedTemplateType as TemplateType,
      () => ({}),
      () => {}
    );

    return <>
      <div class="md-typescale-headline-small" style="margin-bottom: 24px;">
        Create New Template
      </div>

      {/* Common Fields */}
      {this.forms.TextField('templateName', 'Template Name', { required: true })}

      {this.forms.TextArea('templateDescription', 'Description', 3)}

      {/* Template Type Selection */}
      {typeForm.RadioGroup(
        'selectedTemplateType',
        'Template Type',
        [
          { value: 'basic', label: 'Basic' },
          { value: 'advanced', label: 'Advanced' }
        ]
      )}

      {this.forms.EditableList('bags', 'Bags', { placeholder: 'Enter bag name' })}

      {/* Basic Template Fields */}
      {this.selectedTemplateType === 'basic' && (
        <>
          {this.forms.EditableList('plugins', 'Client Plugins', { placeholder: 'Enter plugin name' })}

          {FormBuilder.Divider()}

          {FormBuilder.SectionHeader(
            'Required Plugins',
            'Core plugins enable wiki sync functionality. Disable for vanilla wikis or custom sync implementations.'
          )}

          {this.forms.Checkbox('skipRequiredPlugins', 'Skip Required Plugins')}
        </>
      )}

      {/* Advanced Template Fields */}
      {this.selectedTemplateType === 'advanced' && (
        <>
          {this.forms.FileUpload(
            'htmlFile',
            'Custom HTML File',
            {
              accept: '.html,.htm',
              helperText: 'Upload a static HTML file to use as the wiki base. This allows you to completely replace the wiki page with a custom one, including raw markup, old versions of core, or even a completely different wiki.',
              onFileChange: async (file) => {
                if (file) {
                  this.formValues = {
                    ...this.formValues,
                    htmlContent: await this.parseHtmlFile(file)
                  };
                }
              }
            }
          )}

          {this.forms.TextField(
            'injectionArray',
            'Injection Array',
            {
              required: true,
              helperText: 'Name of the JavaScript array to push tiddlers onto (e.g., $tw.preloadTiddlers)'
            }
          )}

          {this.forms.TextField(
            'injectionLocation',
            'Injection Location',
            {
              required: true,
              helperText: 'Inject the tiddlers BEFORE this string in the HTML file. MUST NOT be inside a script tag! (e.g., <!-- INJECT STORE TIDDLERS HERE -->)'
            }
          )}

          <div class="md-typescale-body-small" style="margin-top: -8px; margin-bottom: 16px; color: var(--mdui-color-on-surface-variant);">
            All HTTP endpoints will still work, and the store tiddlers and
            recipe plugins will be added at the injection location.
            Boot, library, and raw markup tiddlers are not read from
            store and must be included in the HTML manually.
          </div>
        </>
      )}

      {FormBuilder.FormActions(this.closePopup, this.handleSave)}
    </>
  }
}
