import { addstyles, customElement, JSXElement } from "@tiddlywiki/jsx-lit";
import {
  AdminRecord,
  PerTabFieldState,
  DraftChangeHandler,
  PendingRowsChangeHandler,
  PermissionRowsChangeHandler,
  ResolverTitleChangeHandler,
  OperationTriggerHandler,
  FieldTypeHandler,
  fieldTypeHandlers,
  FieldEditorContext
} from "./app";
import { getEmptyItems } from "./definition/store";
import { FieldDefinition, PermissionRow, IdString } from "./definition/tabs";
import css from "./app.inline.css";

// #region Login
type LoginFormMode = "login" | "forgot-password" | "reset-code" | "update-password";
@addstyles(css)
@customElement("mws-login-form")
export class LoginForm extends JSXElement {
  // AGENTS: When the user edits this class directly, treat those changes as intentional and
  // important signals about desired behavior unless they explicitly ask to remove them.
  useLightDOM: boolean = true;

  private readonly itemsByTab = getEmptyItems();
  // #region fields
  private readonly fields: FieldDefinition[] = [
    {
      key: "username",
      label: "Username",
      type: "string",
      mode: "create",
    },
    {
      key: "password",
      label: "Password",
      type: "enter-password",
      mode: "create",
    },
  ];

  private readonly forgotPasswordFields: FieldDefinition[] = [
    {
      key: "email",
      label: "Email address",
      type: "string",
      mode: "create",
    },
  ];

  private readonly resetCodeFields: FieldDefinition[] = [
    {
      key: "resetCode",
      label: "Reset code",
      type: "string",
      mode: "create",
    },
  ];

  private readonly updatePasswordFields: FieldDefinition[] = [
    {
      key: "newPassword",
      label: "New password",
      type: "enter-password",
      mode: "create",
    },
    {
      key: "confirmNewPassword",
      label: "Confirm new password",
      type: "enter-password",
      mode: "create",
    },
  ];
  // #region state
  private readonly state = {
    draft: this.createDraft(),
    saved: this.createDraft(),
    mode: "login" as LoginFormMode,
    isSubmitting: false,
    isResolvingServerState: false,
    rememberMe: false,
    serverState: null as LoginServerState | null,
    submitMessage: new URLSearchParams(globalThis.location?.search ?? "").get("state") === "password-changed"
      ? "Password updated. You can now log in."
      : "",
    operationMessages: {} as Record<string, string>,
    pendingRows: {} as Record<string, number>,
    transientPermissionRows: {} as Record<string, PermissionRow[]>,
  };

  private serverStatePromise: Promise<LoginServerState> | null = null;

  private createDraft(): LoginDraft {
    return {
      id: new IdString(""),
      confirmNewPassword: "",
      email: "",
      newPassword: "",
      resetCode: "",
      username: "",
      password: "",
    };
  }

  private get fieldState(): PerTabFieldState {
    return {
      tabId: "users",
      mode: "create",
      draft: this.state.draft,
      saved: this.state.saved,
      resolverTitle: "",
      operationMessages: this.state.operationMessages,
      pendingRows: this.state.pendingRows,
      transientPermissionRows: this.state.transientPermissionRows,
    };
  }
  // #region context
  private readonly updateDraft: DraftChangeHandler = (fieldKey, value) => {
    (this.state.draft as unknown as Record<string, unknown>)[fieldKey] = value;
    this.requestUpdate();
  };

  private readonly updatePendingRows: PendingRowsChangeHandler = (fieldKey, updater) => {
    this.state.pendingRows[fieldKey] = Math.max(0, updater(this.state.pendingRows[fieldKey] ?? 0));
    this.requestUpdate();
  };

  private readonly updateTransientPermissionRows: PermissionRowsChangeHandler = (fieldKey, rows) => {
    this.state.transientPermissionRows[fieldKey] = rows;
    this.requestUpdate();
  };

  private readonly updateResolverTitle: ResolverTitleChangeHandler = () => {
    this.requestUpdate();
  };

  private readonly triggerOperation: OperationTriggerHandler = (fieldKey, message) => {
    this.state.operationMessages[fieldKey] = message;
    this.requestUpdate();
  };

  private readonly updateRememberMe = (value: boolean) => {
    this.state.rememberMe = value;
    this.requestUpdate();
  };

  private readonly setMode = (mode: LoginFormMode) => {
    this.state.mode = mode;
    this.state.submitMessage = "";
    this.requestUpdate();
  };

  private ensureServerState(): Promise<LoginServerState> {
    if (this.state.serverState) return Promise.resolve(this.state.serverState);
    if (!this.serverStatePromise) {
      this.state.isResolvingServerState = true;
      this.requestUpdate();
      this.serverStatePromise = this.loadServerStateInternal().then((serverState) => {
        this.state.serverState = serverState;
        return serverState;
      }).finally(() => {
        this.state.isResolvingServerState = false;
        this.serverStatePromise = null;
        this.requestUpdate();
      });
    }
    return this.serverStatePromise;
  }

  // #region login
  private readonly handleLoginSubmit = async () => {
    this.state.isSubmitting = true;
    this.state.submitMessage = "";
    this.requestUpdate();

    try {
      this.state.submitMessage = "Logging in…";
      this.requestUpdate();
      if (await this.submitLogin()) {
        location.href = location.origin + pathPrefix + "/";
      } else {
        this.state.submitMessage = "Login failed."
      }
    } catch (error) {
      this.state.submitMessage = error instanceof Error ? error.message : "Login failed.";
    } finally {
      this.state.isSubmitting = false;
      this.requestUpdate();
    }
  };

  // #region forgot

  private readonly handleForgotPasswordClick = async () => {
    this.state.isSubmitting = false;
    this.state.submitMessage = "";
    this.state.mode = "forgot-password";
    this.requestUpdate();
    const serverState = await this.ensureServerState();
    if (!serverState.emailEnabled) {
      this.state.mode = "reset-code";
      this.state.submitMessage = "Email services are not setup. Ask an admin for a reset code.";
      this.requestUpdate();
      return;
    }
  }

  private readonly handleForgotPasswordSubmit = async () => {
    this.state.isSubmitting = true;
    this.state.submitMessage = "Sending reset email…";
    this.requestUpdate();

    try {

      if (await this.submitForgotPassword()) {
        this.state.mode = "reset-code";
        this.state.submitMessage = "";
      } else {
        this.state.submitMessage = "Reset email failed.";
      }
    } catch (error) {
      this.state.submitMessage = error instanceof Error ? error.message : "Reset email failed.";
    } finally {
      this.state.isSubmitting = false;
      this.requestUpdate();
    }
  };
  // #region code
  private readonly handleResetCodeSubmit = async () => {
    this.state.isSubmitting = true;
    this.state.submitMessage = "Verifying reset code…";
    this.requestUpdate();

    try {
      if (await this.submitResetCode()) {
        this.state.mode = "update-password";
        this.state.submitMessage = "";
      } else {
        this.state.submitMessage = "Reset code failed.";
      }
    } catch (error) {
      this.state.submitMessage = error instanceof Error ? error.message : "Reset code failed.";
    } finally {
      this.state.isSubmitting = false;
      this.requestUpdate();
    }
  };
  // #region update
  private readonly handleUpdatePasswordSubmit = async () => {
    const newPassword = this.state.draft.newPassword;
    const confirmNewPassword = this.state.draft.confirmNewPassword;

    if (!newPassword || !confirmNewPassword) {
      this.state.submitMessage = "Enter and confirm your new password.";
      this.requestUpdate();
      return;
    }

    if (newPassword !== confirmNewPassword) {
      this.state.submitMessage = "Passwords do not match.";
      this.requestUpdate();
      return;
    }

    this.state.isSubmitting = true;
    this.state.submitMessage = "Updating password…";
    this.requestUpdate();

    try {
      if (await this.submitUpdatePassword()) {
        location.search = "?state=password-changed";
        return new Promise(() => { });
      } else {
        this.state.submitMessage = "Password update failed.";
      }
    } catch (error) {
      this.state.submitMessage = error instanceof Error ? error.message : "Password update failed.";
      this.state.isSubmitting = false;
    } finally {
      this.requestUpdate();
    }
  };
  // #region field
  private renderField(field: FieldDefinition): JSX.Node {
    const handler: FieldTypeHandler = fieldTypeHandlers[field.type];
    const value = (this.state.draft as unknown as Record<string, unknown>)[field.key] ?? "";
    const saved = (this.state.saved as unknown as Record<string, unknown>)[field.key] ?? "";
    const inputId = `login-${field.key}`;

    return (
      <div class="login-field">
        <label class="login-field-label" for={inputId}>{field.label}</label>
        {handler.renderEditor({
          field: field as unknown as FieldDefinition,
          value,
          saved,
          disabled: this.state.isSubmitting,
          fieldState: this.fieldState,
          itemsByTab: this.itemsByTab,
          onDraftChange: this.updateDraft,
          onPendingRowsChange: this.updatePendingRows,
          onTransientPermissionRowsChange: this.updateTransientPermissionRows,
          onResolverTitleChange: this.updateResolverTitle,
          onTriggerOperation: this.triggerOperation,
          inputId,
        } as FieldEditorContext)}
      </div>
    );
  }
  // #region common
  // Keep the shared card structure in one place so each form mode only supplies its
  // mode-specific title, copy, fields, extra content, and actions.
  private renderCommon(title: string, copy: string, fields: JSX.Node, extra: JSX.Node, actions: JSX.Node): JSX.Node {
    return (
      <div class="admin-shell">
        <section class="modal-card" aria-label="Login form" style="max-width: 30rem; margin: 0 auto; width: 100%;">
          <header class="login-card-header">
            <div class="login-card-title">
              <h3>{title}</h3>
              <p class="login-card-copy">{copy}</p>
              {/* {this.state.serverState ? <p class="login-card-meta">Server state ready.</p> : null} */}
            </div>
          </header>

          <div class="login-card-body">
            <div class="login-fields">{fields}</div>

            {extra}

            {this.state.submitMessage ? (
              <div class="login-feedback" role="status" aria-live="polite">
                <p>{this.state.submitMessage}</p>
              </div>
            ) : null}

            <footer class="login-actions">{actions}</footer>
          </div>
        </section>
      </div>
    );
  }

  protected render() {
    this.ensureServerState();

    switch (this.state.mode) {
      // #region login
      case "login": {
        const isLoginPageBusy = this.state.isSubmitting;
        return this.renderCommon(
          "Log in",
          "Enter your account credentials to continue.",
          <>{this.fields.map((field) => this.renderField(field))}</>,
          <div class="login-options" aria-label="Login options">
            <label class="login-checkbox" for="login-remember-me">
              <input
                id="login-remember-me"
                class="login-checkbox-input"
                type="checkbox"
                checked={this.state.rememberMe}
                disabled={isLoginPageBusy}
                ref={(element) => {
                  if (element.checked !== this.state.rememberMe) element.checked = this.state.rememberMe;
                }}
                onchange={(event) => this.updateRememberMe((event.currentTarget as HTMLInputElement).checked)} />
              <span>Remember me</span>
            </label>

            <button class="login-link-button" type="button" disabled={isLoginPageBusy} onclick={() => this.handleForgotPasswordClick()}>Forgot password?</button>
          </div>,
          <button class="primary-button login-submit" type="button" disabled={isLoginPageBusy} onclick={() => void this.handleLoginSubmit()}>{this.state.isSubmitting ? "Logging in…" : "Log in"}</button>
        );
      }
      // #region forgot
      case "forgot-password": {
        const isBusy = this.state.isSubmitting || this.state.isResolvingServerState;
        const isForgotPasswordEmailEnabled = this.state.serverState?.emailEnabled === true;
        const forgotPasswordFieldsContent = this.state.isResolvingServerState
          ? <div class="modal-loading-shell">
            <div class="modal-loading-bar" aria-hidden="true"><span></span></div>
            <p class="modal-loading-copy">Please wait, loading server state...</p>
          </div>
          : isForgotPasswordEmailEnabled
            ? <>{this.forgotPasswordFields.map((field) => this.renderField(field))}</>
            : <div class="field-callout"><p>Password reset email is disabled. Contact your administrator.</p></div>;

        const forgotPasswordActionDisabled = isBusy || !isForgotPasswordEmailEnabled;
        return this.renderCommon(
          "Forgot password",
          "Enter your email and we will send a reset link.",
          forgotPasswordFieldsContent,
          null,
          <div class="login-action-row">
            <button class="ghost-button" type="button" disabled={isBusy} onclick={() => this.setMode("login")}>Cancel</button>
            <button class="primary-button login-submit" type="button" disabled={forgotPasswordActionDisabled} onclick={() => void this.handleForgotPasswordSubmit()}>Send email</button>
          </div>
        );
      }
      // #region code
      case "reset-code": {
        return this.renderCommon(
          "Enter reset code",
          "Enter the password reset code sent to your email.",
          <>{this.resetCodeFields.map((field) => this.renderField(field))}</>,
          null,
          <div class="login-action-row">
            <button class="ghost-button" type="button" disabled={this.state.isSubmitting} onclick={() => this.setMode("forgot-password")}>Back</button>
            <button class="primary-button login-submit" type="button" disabled={this.state.isSubmitting} onclick={() => void this.handleResetCodeSubmit()}>Verify code</button>
          </div>
        );
      }
      // #region update
      case "update-password": {
        const passwordsDoNotMatch = Boolean(
          this.state.draft.newPassword
          && this.state.draft.confirmNewPassword
          && this.state.draft.newPassword !== this.state.draft.confirmNewPassword
        );
        const updatePasswordActionDisabled = this.state.isSubmitting
          || !this.state.draft.newPassword
          || !this.state.draft.confirmNewPassword
          || passwordsDoNotMatch;
        return this.renderCommon(
          "Update password",
          "Choose a new password for your account.",
          <>{this.updatePasswordFields.map((field) => this.renderField(field))}</>,
          null,
          <div class="login-action-row">
            <button class="ghost-button" type="button" disabled={this.state.isSubmitting} onclick={() => this.setMode("reset-code")}>Back</button>
            <button class="primary-button login-submit" type="button" disabled={updatePasswordActionDisabled} onclick={() => void this.handleUpdatePasswordSubmit()}>Update password</button>
          </div>
        );
      }
    }

  }


  private submitLogin = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.state.draft;
    return true;
  }
  private submitForgotPassword = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.state.draft;
    return true;
  }
  private submitResetCode = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.state.draft;
    return true;
  }
  private submitUpdatePassword = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.state.draft;
    return true;
  }

  private async loadServerStateInternal(): Promise<LoginServerState> {
    return {
      csrfToken: "pretend-csrf-token",
      emailEnabled: false,
    };
  }

}
type LoginDraft = AdminRecord & {
  confirmNewPassword: string;
  email: string;
  newPassword: string;
  resetCode: string;
  username: string;
  password: string;
};

type LoginServerState = {
  csrfToken: string;
  emailEnabled: boolean;
};