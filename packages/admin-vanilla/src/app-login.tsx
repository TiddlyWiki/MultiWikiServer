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
import { changeExistingPasswordWithCode, loginWithOpaque, serverAcceptResetCode } from "./passwords";

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
      key: "emailOrUsername",
      label: "Email / username",
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
      emailOrUsername: "",
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
  // #region handleAny
  private readonly handleAnySubmit = async (message: string, failed: string, cb: () => Promise<boolean>) => {
    this.isSubmitting = true;
    this.submitMessage = message;
    try {
      if (!await cb()) {
        this.submitMessage = failed
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
  }

  private readonly handleLoginSubmit = async () => {
    await this.handleAnySubmit(
      "Logging in…",
      "Login failed.",
      () => this.submitLogin()
    );
  };

  private readonly handleBackClick = async () => {
    this.submitMessage = "";
    switch (this.mode) {
      case "login": break;
      case "forgot-password": {
        this.mode = "login";
      }; break;
      case "reset-code": {
        const serverState = await this.ensureServerState();
        if (!serverState.emailEnabled) {
          this.mode = "login";
        } else {
          this.mode = "forgot-password";
        }
      }; break;
      case "update-password": {
        this.mode = "reset-code";
      }; break;
    }

  }

  private readonly handleForgotPasswordClick = async () => {
    this.submitMessage = "";
    this.mode = "forgot-password";
    const serverState = await this.ensureServerState();
    if (!serverState.emailEnabled) {
      this.mode = "reset-code";
      return;
    }
  }

  private readonly handleForgotPasswordSubmit = async () => {
    const serverState = await this.ensureServerState();
    if (!serverState.emailEnabled) {
      this.mode = "reset-code";
      return;
    }
    await this.handleAnySubmit(
      "Sending reset email…",
      "Reset email failed.",
      () => this.submitForgotPassword()
    );
  };

  private readonly handleResetCodeSubmit = async () => {
    await this.handleAnySubmit(
      "Verifying reset code…",
      "Reset code failed.",
      () => this.submitResetCode()
    );
  };

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

    await this.handleAnySubmit(
      "Updating password…",
      "Password update failed.",
      () => this.submitUpdatePassword()
    );
  };

  // #region field

  private renderField(field: FieldDefinition): JSX.Node {
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
  private renderCommon({ title, copy, submitDisabled, submitAction, submitLabel, isLogin }: {
    title: string;
    copy: string;
    // fields: JSX.Node;
    // extra: JSX.Node;
    submitDisabled: boolean;
    submitLabel: string;
    submitAction: () => Promise<void>;
    isLogin?: boolean;
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

            {isLogin ? (
              <button
                class="primary-button login-submit"
                type="button"
                disabled={submitDisabled}
                onclick={submitAction}
              >{submitLabel}</button>
            ) : (
              <footer class="login-actions">
                <div class="login-action-row">
                  {!isLogin && <button class="ghost-button"
                    type="button"
                    disabled={this.isSubmitting}
                    onclick={this.handleBackClick}
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

  protected render() {
    this.ensureServerState();

    switch (this.mode) {
      // #region login
      case "login": {
        const isLoginPageBusy = this.isSubmitting;
        return this.renderCommon({
          title: "Log in",
          copy: "Enter your account credentials to continue.",
          submitAction: this.handleLoginSubmit,
          submitDisabled: isLoginPageBusy,
          submitLabel: this.isSubmitting ? "Logging in…" : "Log in",
          isLogin: true,
        }, <>
          <div class="login-fields">{this.fields.map((field) => this.renderField(field))}</div>
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

            <button
              class="login-link-button"
              type="button"
              disabled={isLoginPageBusy}
              onclick={() => this.handleForgotPasswordClick()}
            >Forgot password?</button>
          </div>
        </>);
      }
      // #region forgot
      case "forgot-password": {
        const isForgotPasswordEmailEnabled = !this.serverState || this.serverState.emailEnabled;
        const isSubmitDisabled = this.isSubmitting || this.isResolvingServerState
          || !this.draft.emailOrUsername

        return this.renderCommon({
          title: "Forgot password",
          copy: "Enter your email and we will send a reset link.",
          submitAction: this.handleForgotPasswordSubmit,
          submitDisabled: isSubmitDisabled,
          submitLabel: isForgotPasswordEmailEnabled ? "Send Email" : "Enter Code"
        }, this.isResolvingServerState ? (
          <div class="modal-loading-shell">
            <div class="modal-loading-bar" aria-hidden="true"><span></span></div>
            <p class="modal-loading-copy">Please wait, loading server state...</p>
          </div>
        ) : (
          <div class="login-fields">
            {this.forgotPasswordFields.map((field) => this.renderField(field))}
          </div>
        ));
      }
      // #region code
      case "reset-code": {
        console.log(this.draft);
        const adminCode = this.serverState && !this.serverState.emailEnabled;
        const resetCodeActionDisabled = this.isResolvingServerState || this.isSubmitting
          || !this.draft.emailOrUsername
          || !this.draft.resetCode;
        return this.renderCommon({
          title: "Enter reset code",
          copy: "Enter your password reset code.",
          submitAction: this.handleResetCodeSubmit,
          submitDisabled: resetCodeActionDisabled,
          submitLabel: "Verify code",
        }, <>
          <div class="login-fields">
            {!this.serverState?.emailEnabled &&
              this.forgotPasswordFields.map((field) => this.renderField(field))
            }
            {this.resetCodeFields.map((field) => this.renderField(field))}
          </div>
          {adminCode && this.renderCallout("Email services are not setup. Ask an admin for a reset code.")}
        </>);
      }
      // #region update
      case "update-password": {

        const updatePasswordActionDisabled = this.isSubmitting
          || !this.draft.newPassword
          || !this.draft.confirmNewPassword
          || this.draft.newPassword !== this.draft.confirmNewPassword;

        return this.renderCommon({
          title: "Update password",
          copy: "Choose a new password for your account.",
          submitAction: this.handleUpdatePasswordSubmit,
          submitDisabled: updatePasswordActionDisabled,
          submitLabel: "Update password",
        }, <>
          <div class="login-fields">
            {this.renderCallout("Username: " + this.draft.username)}
            {this.updatePasswordFields.map((field) => this.renderField(field))}
          </div>
        </>);
      }
    }

  }

  renderCallout = (content: JSX.Node) => <div class="field-callout"><p>{content}</p></div>;

  private submitLogin = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.draft;
    this.rememberMe;
    await loginWithOpaque(clientState.username, clientState.password, true);
    location.href = location.origin + pathPrefix + "/";
    return true;
  }
  private submitForgotPassword = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.draft;
    this.mode = "reset-code";
    this.submitMessage = "";
    return true;
  }
  private submitResetCode = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.draft;
    const { user_id, username } = await serverAcceptResetCode({
      resetCode: clientState.resetCode,
      csrfToken: serverState.csrfToken,
      emailOrUsername: clientState.emailOrUsername,
    });
    clientState.id = new IdString(user_id);
    clientState.username = username;
    this.mode = "update-password";
    this.submitMessage = "";
    return true;
  }
  private submitUpdatePassword = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.draft;
    await changeExistingPasswordWithCode({
      user_id: clientState.id.toString(),
      username: clientState.username,
      resetCode: clientState.resetCode,
      newPassword: clientState.newPassword,
    });
    location.search = "?state=password-changed";
    return new Promise(() => { });
    return true;
  }

  private async loadServerStateInternal(): Promise<LoginServerState> {
    await new Promise(r => { setTimeout(r, 2000); });
    return {
      csrfToken: "pretend-csrf-token",
      emailEnabled: false,
    };
  }

}
type LoginDraft = AdminRecord & {
  confirmNewPassword: string;
  emailOrUsername: string;
  newPassword: string;
  resetCode: string;
  username: string;
  password: string;
};

type LoginServerState = {
  csrfToken: string;
  emailEnabled: boolean;
};

