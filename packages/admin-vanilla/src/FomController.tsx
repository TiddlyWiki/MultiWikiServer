import { JSXElement } from "../../jsx-lit/src/JSXElement";
import { AdminRecord, PerTabFieldState, DraftChangeHandler, PendingRowsChangeHandler, PermissionRowsChangeHandler, ResolverTitleChangeHandler, OperationTriggerHandler } from "./app";
import { renderFieldEditor } from "./definition/renders";
import { getEmptyItems } from "./definition/store";
import { PermissionRow, FieldDefinition } from "./definition/tabs";
import { requestUpdate } from "./requestUpdate";


export class FomController<T extends AdminRecord> {


  constructor(public context: JSXElement & { draft: T }) { }

  private get draft(): T { return this.context.draft }

  private readonly itemsByTab = getEmptyItems();

  requestUpdate() { this.context.requestUpdate(); }

  @requestUpdate private accessor isSubmitting: boolean = false;
  @requestUpdate private accessor submitMessage: string = new URLSearchParams(globalThis.location?.search ?? "").get("state") === "password-changed"
    ? "Password updated. You can now log in."
    : "";
  @requestUpdate private accessor operationMessages: Record<string, string> = {};
  @requestUpdate private accessor pendingRows: Record<string, number> = {};
  @requestUpdate private accessor transientPermissionRows: Record<string, PermissionRow[]> = {};

  private get fieldState(): PerTabFieldState {
    return {
      tabId: "users",
      mode: "create",
      draft: this.draft,
      saved: this.draft,
      resolverTitle: "",
      operationMessages: this.operationMessages,
      pendingRows: this.pendingRows,
      transientPermissionRows: this.transientPermissionRows,
    };
  }

  // #region context
  private readonly updateDraft: DraftChangeHandler = (fieldKey, value) => {
    (this.draft as unknown as Record<string, unknown>)[fieldKey] = value;
    this.requestUpdate();
  };

  private readonly updatePendingRows: PendingRowsChangeHandler = (fieldKey, updater) => {
    this.pendingRows[fieldKey] = Math.max(0, updater(this.pendingRows[fieldKey] ?? 0));
    this.requestUpdate();
  };

  private readonly updateTransientPermissionRows: PermissionRowsChangeHandler = (fieldKey, rows) => {
    this.transientPermissionRows[fieldKey] = rows;
    this.requestUpdate();
  };

  private readonly updateResolverTitle: ResolverTitleChangeHandler = () => {
    this.requestUpdate();
  };

  private readonly triggerOperation: OperationTriggerHandler = (fieldKey, message) => {
    this.operationMessages[fieldKey] = message;
    this.requestUpdate();
  };


  // #region handleAny
  readonly handleAnySubmit = async (message: string, failed: string, cb: () => Promise<boolean>) => {
    this.isSubmitting = true;
    this.submitMessage = message;
    try {
      if (!await cb()) {
        this.submitMessage = failed;
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        try {
          const se = JSON.parse(error.message);
          if (se.reason && se.status) {
            this.submitMessage = se.reason;
            if (se.details) {
              Object.entries(se.details).forEach(([k, v]) => {
                this.submitMessage += "\n" + k + ": " + v;
              });
            }
            return;
          }
        } catch (e) {
        }
      }
      this.submitMessage = error instanceof Error ? error.message : failed;
    } finally {
      this.isSubmitting = false;
    }
  };

  // #region field
  renderField(field: FieldDefinition): JSX.Node {
    const value = (this.draft as any)[field.key] ?? "";
    const inputId = `login-${field.key}`;

    return (
      <div class="login-field">
        <label class="login-field-label" for={inputId}>{field.label}</label>
        {renderFieldEditor({
          field: field as unknown as FieldDefinition,
          value,
          disabled: this.isSubmitting,
          fieldState: this.fieldState,
          itemsByTab: this.itemsByTab,
          onDraftChange: this.updateDraft,
          onPendingRowsChange: this.updatePendingRows,
          onTransientPermissionRowsChange: this.updateTransientPermissionRows,
          onResolverTitleChange: this.updateResolverTitle,
          onTriggerOperation: this.triggerOperation,
          inputId,
        })}
      </div>
    );
  }
  // #region common
  // Keep the shared card structure in one place so each form mode only supplies its
  // mode-specific title, copy, fields, extra content, and actions.
  renderCommon({ title, copy, submitDisabled, submitAction, submitLabel, isStart: isStart, handleBackClick }: {
    title: string;
    copy: string;
    submitDisabled: boolean;
    submitLabel: string;
    submitAction: () => Promise<void>;
    handleBackClick: () => Promise<void>;
    isStart?: boolean;
  }, content: JSX.Node): JSX.Node {
    return (
      <div class="admin-shell">
        <section class="modal-card" aria-label="Login form" style="max-width: 30rem; margin: 0 auto; width: 100%;">
          <header class="login-card-header">
            <div class="login-card-title">
              <h3>{title}</h3>
              <p class="login-card-copy">{copy}</p>
              {/* {this.serverState ? <p class="login-card-meta">Server state ready.</p> : null} */}
            </div>
          </header>

          <div class="login-card-body">
            {content}

            {this.submitMessage ? (
              <div class="login-feedback" role="status" aria-live="polite">
                {this.submitMessage.split("\n").map(e => <p>{e}</p>)}
              </div>
            ) : null}

            {isStart ? (
              <button
                class="primary-button login-submit"
                type="button"
                disabled={submitDisabled}
                onclick={submitAction}
              >{submitLabel}</button>
            ) : (
              <footer class="login-actions">
                <div class="login-action-row">
                  {!isStart && <button class="ghost-button"
                    type="button"
                    disabled={this.isSubmitting}
                    onclick={handleBackClick}
                  >Cancel</button>}
                  <button
                    class="primary-button login-submit"
                    type="button"
                    disabled={submitDisabled}
                    onclick={submitAction}
                  >{submitLabel}</button>
                </div>
              </footer>
            )}

          </div>
        </section>
      </div>
    );
  }

}
