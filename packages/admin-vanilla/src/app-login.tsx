import { addstyles, customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import {
  AdminRecord,
  PerTabFieldState,
  DraftChangeHandler,
  PendingRowsChangeHandler,
  PermissionRowsChangeHandler,
  ResolverTitleChangeHandler,
  OperationTriggerHandler,
} from "./app";
import { getEmptyItems } from "./definition/store";
import { FieldDefinition, PermissionRow, IdString } from "./definition/tabs";
import css from "./app.inline.css";
import { renderFieldEditor } from "./definition/renders";

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
  @state() accessor test: boolean = false;
  @state() accessor draft: LoginDraft = this.createDraft();
  @state() accessor saved: LoginDraft = this.createDraft();
  @state() accessor mode: LoginFormMode = "login";
  @state() accessor isSubmitting: boolean = false;
  @state() accessor isResolvingServerState: boolean = false;
  @state() accessor rememberMe: boolean = false;
  @state() accessor serverState: LoginServerState | null = null;
  @state() accessor submitMessage: string = new URLSearchParams(globalThis.location?.search ?? "").get("state") === "password-changed"
    ? "Password updated. You can now log in."
    : "";
  @state() accessor operationMessages: Record<string, string> = {};
  @state() accessor pendingRows: Record<string, number> = {};
  @state() accessor transientPermissionRows: Record<string, PermissionRow[]> = {};

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
      draft: this.draft,
      saved: this.saved,
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

  private readonly updateRememberMe = (value: boolean) => {
    this.rememberMe = value;
  };

  private readonly setMode = (mode: LoginFormMode) => {
    this.mode = mode;
    this.submitMessage = "";
  };

  private ensureServerState(): Promise<LoginServerState> {
    if (this.serverState) return Promise.resolve(this.serverState);
    if (!this.serverStatePromise) {
      this.isResolvingServerState = true;
      this.serverStatePromise = this.loadServerStateInternal().then((serverState) => {
        this.serverState = serverState;
        return serverState;
      }).finally(() => {
        this.isResolvingServerState = false;
        this.serverStatePromise = null;
      });
    }
    return this.serverStatePromise;
  }

  // #region login
  private readonly handleLoginSubmit = async () => {
    this.isSubmitting = true;
    this.submitMessage = "";

    try {
      this.submitMessage = "Logging in…";
      if (await this.submitLogin()) {
        location.href = location.origin + pathPrefix + "/";
      } else {
        this.submitMessage = "Login failed."
      }
    } catch (error) {
      this.submitMessage = error instanceof Error ? error.message : "Login failed.";
    } finally {
      this.isSubmitting = false;
    }
  };

  // #region forgot

  private readonly handleForgotPasswordClick = async () => {
    this.isSubmitting = false;
    this.submitMessage = "";
    this.mode = "forgot-password";
    const serverState = await this.ensureServerState();
    if (!serverState.emailEnabled) {
      this.mode = "reset-code";
      this.submitMessage = "Email services are not setup. Ask an admin for a reset code.";
      return;
    }
  }

  private readonly handleForgotPasswordSubmit = async () => {
    const serverState = await this.ensureServerState();
    if (!serverState.emailEnabled) {
      this.mode = "reset-code";
      this.submitMessage = "Email services are not setup. Ask an admin for a reset code.";
      return;
    }
    this.isSubmitting = true;
    this.submitMessage = "Sending reset email…";

    try {

      if (await this.submitForgotPassword()) {
        this.mode = "reset-code";
        this.submitMessage = "";
      } else {
        this.submitMessage = "Reset email failed.";
      }
    } catch (error) {
      this.submitMessage = error instanceof Error ? error.message : "Reset email failed.";
    } finally {
      this.isSubmitting = false;
    }
  };
  // #region code
  private readonly handleResetCodeSubmit = async () => {
    this.isSubmitting = true;
    this.submitMessage = "Verifying reset code…";

    try {
      if (await this.submitResetCode()) {
        this.mode = "update-password";
        this.submitMessage = "";
      } else {
        this.submitMessage = "Reset code failed.";
      }
    } catch (error) {
      this.submitMessage = error instanceof Error ? error.message : "Reset code failed.";
    } finally {
      this.isSubmitting = false;
    }
  };
  // #region update
  private readonly handleUpdatePasswordSubmit = async (): Promise<void> => {
    const newPassword = this.draft.newPassword;
    const confirmNewPassword = this.draft.confirmNewPassword;

    if (!newPassword || !confirmNewPassword) {
      this.submitMessage = "Enter and confirm your new password.";
      return;
    }

    if (newPassword !== confirmNewPassword) {
      this.submitMessage = "Passwords do not match.";
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = "Updating password…";

    try {
      if (await this.submitUpdatePassword()) {
        location.search = "?state=password-changed";
        return new Promise(() => { });
      } else {
        this.submitMessage = "Password update failed.";
      }
    } catch (error) {
      this.submitMessage = error instanceof Error ? error.message : "Password update failed.";
      this.isSubmitting = false;
    }

  };
  // #region field
  private renderField(field: FieldDefinition): JSX.Node {
    const value = (this.draft as unknown as Record<string, unknown>)[field.key] ?? "";
    const saved = (this.saved as unknown as Record<string, unknown>)[field.key] ?? "";
    const inputId = `login-${field.key}`;

    return (
      <div class="login-field">
        <label class="login-field-label" for={inputId}>{field.label}</label>
        {renderFieldEditor({
          field: field as unknown as FieldDefinition,
          value,
          saved,
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
  private renderCommon(title: string, copy: string, fields: JSX.Node, extra: JSX.Node, actions: JSX.Node): JSX.Node {
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
            <div class="login-fields">{fields}</div>

            {extra}

            {this.submitMessage ? (
              <div class="login-feedback" role="status" aria-live="polite">
                <p>{this.submitMessage}</p>
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

    switch (this.mode) {
      // #region login
      case "login": {
        const isLoginPageBusy = this.isSubmitting;
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
                checked={this.rememberMe}
                disabled={isLoginPageBusy}
                ref={(element) => {
                  if (element.checked !== this.rememberMe) element.checked = this.rememberMe;
                }}
                onchange={(event) => this.updateRememberMe((event.currentTarget as HTMLInputElement).checked)} />
              <span>Remember me</span>
            </label>

            <button class="login-link-button" type="button" disabled={isLoginPageBusy} onclick={() => this.handleForgotPasswordClick()}>Forgot password?</button>
          </div>,
          <button class="primary-button login-submit" type="button" disabled={isLoginPageBusy} onclick={() => void this.handleLoginSubmit()}>{this.isSubmitting ? "Logging in…" : "Log in"}</button>
        );
      }
      // #region forgot
      case "forgot-password": {
        const isBusy = this.isSubmitting || this.isResolvingServerState;
        const isForgotPasswordEmailEnabled = this.serverState?.emailEnabled === true;
        const forgotPasswordFieldsContent = this.isResolvingServerState
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
            <button class="primary-button login-submit" type="button" onclick={() => void this.handleForgotPasswordSubmit()}>
              {isForgotPasswordEmailEnabled ? "Send Email" : "Enter Code"}
            </button>
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
            <button class="ghost-button" type="button" disabled={this.isSubmitting} onclick={() => this.setMode("forgot-password")}>Back</button>
            <button class="primary-button login-submit" type="button" disabled={this.isSubmitting} onclick={() => void this.handleResetCodeSubmit()}>Verify code</button>
          </div>
        );
      }
      // #region update
      case "update-password": {
        const passwordsDoNotMatch = Boolean(
          this.draft.newPassword
          && this.draft.confirmNewPassword
          && this.draft.newPassword !== this.draft.confirmNewPassword
        );
        const updatePasswordActionDisabled = this.isSubmitting
          || !this.draft.newPassword
          || !this.draft.confirmNewPassword
          || passwordsDoNotMatch;
        return this.renderCommon(
          "Update password",
          "Choose a new password for your account.",
          <>
            {this.renderCallout("Username: " + this.draft.username)}
            {this.updatePasswordFields.map((field) => this.renderField(field))}
          </>,
          null,
          <div class="login-action-row">
            <button class="ghost-button" type="button" disabled={this.isSubmitting} onclick={() => this.setMode("reset-code")}>Back</button>
            <button class="primary-button login-submit" type="button" disabled={updatePasswordActionDisabled} onclick={() => void this.handleUpdatePasswordSubmit()}>Update password</button>
          </div>
        );
      }
    }

  }

  renderCallout = (content: JSX.Node) => <div class="field-callout"><p>{content}</p></div>;

  private submitLogin = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.draft;
    return true;
  }
  private submitForgotPassword = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.draft;
    return true;
  }
  private submitResetCode = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.draft;
    const { user_id, username } = await serverAcceptResetCode({
      resetCode: clientState.resetCode,
      csrfToken: serverState.csrfToken,
    });
    clientState.id = new IdString(user_id);
    clientState.username = username;
    return true;
  }
  private submitUpdatePassword = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.draft;
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

async function serverAcceptResetCode(args: {
  resetCode: string;
  csrfToken: string;
}): Promise<{
  // required to create the new password
  user_id: string;
  // useful for user confirmation
  username: string;
}> {
  return {
    user_id: "",
    username: "test",
  }
}