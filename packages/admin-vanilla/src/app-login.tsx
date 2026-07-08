import { addstyles, customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import {
  AdminRecord,
} from "./app";
import { FieldDefinition, IdString } from "./definition/tabs";
import css from "./app.inline.css";
import { changeExistingPasswordWithCode, loginWithOpaque, serverAcceptResetCode } from "./passwords";
import { FomController } from "./FomController";

// #region Login
type LoginFormMode = "login" | "forgot-password" | "reset-code" | "update-password";

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

const renderCallout = (content: JSX.Node) => <div class="field-callout"><p>{content}</p></div>;

@addstyles(css)
@customElement("mws-login-form")
export class LoginForm extends JSXElement {
  // AGENTS: When the user edits this class directly, treat those changes as intentional and
  // important signals about desired behavior unless they explicitly ask to remove them.
  useLightDOM: boolean = true;
  constructor() { super(); }

  control: FomController<LoginDraft> = new FomController<LoginDraft>(this);

  handleAnySubmit: FomController<LoginDraft>["handleAnySubmit"] = (...args) => this.control.handleAnySubmit(...args)


  // #region state
  @state() accessor draft: LoginDraft = this.createDraft();

  @state() private accessor mode: LoginFormMode = "login";
  @state() private accessor isSubmitting: boolean = false;
  @state() private accessor isResolvingServerState: boolean = false;
  @state() private accessor rememberMe: boolean = false;
  @state() private accessor serverState: LoginServerState | null = null;
  @state() private accessor submitMessage: string = new URLSearchParams(globalThis.location?.search ?? "").get("state") === "password-changed"
    ? "Password updated. You can now log in."
    : "";


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

  private serverStatePromise: Promise<LoginServerState> | null = null;
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


  private readonly handleLoginSubmit = async () => {
    await this.handleAnySubmit(
      "Logging in…",
      "Login failed.",
      () => this.submitLogin()
    );
  };

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


  protected render() {
    this.ensureServerState();

    switch (this.mode) {
      // #region login
      case "login": {
        const isLoginPageBusy = this.isSubmitting;

        return this.control.renderCommon({
          title: "Log in",
          copy: "Enter your account credentials to continue.",
          submitAction: this.handleLoginSubmit,
          submitDisabled: isLoginPageBusy,
          submitLabel: this.isSubmitting ? "Logging in…" : "Log in",
          isStart: true,
          backAction: this.handleBackClick,
        }, <>
          <div class="login-fields">{this.fields.map((field) => this.control.renderField(field))}</div>
          <div class="login-options" aria-label="Login options">
            <label class="login-checkbox" for="login-remember-me">
              <input
                id="login-remember-me"
                class="login-checkbox-input"
                type="checkbox"
                checked={this.rememberMe}
                disabled={isLoginPageBusy}
                ref={(element) => {
                  if (element.checked !== this.rememberMe)
                    element.checked = this.rememberMe;
                }}
                onchange={(event) => {
                  this.rememberMe = event.currentTarget.checked;
                }} />
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

        return this.control.renderCommon({
          title: "Forgot password",
          copy: "Enter your email and we will send a reset link.",
          submitAction: this.handleForgotPasswordSubmit,
          submitDisabled: isSubmitDisabled,
          submitLabel: isForgotPasswordEmailEnabled ? "Send Email" : "Enter Code",
          backAction: this.handleBackClick,
        }, this.isResolvingServerState ? (
          <div class="modal-loading-shell">
            <div class="modal-loading-bar" aria-hidden="true"><span></span></div>
            <p class="modal-loading-copy">Please wait, loading server state...</p>
          </div>
        ) : (
          <div class="login-fields">
            {this.forgotPasswordFields.map((field) => this.control.renderField(field))}
          </div>
        ));
      }
      // #region code
      case "reset-code": {
        const adminCode = this.serverState && !this.serverState.emailEnabled;

        const resetCodeActionDisabled = this.isResolvingServerState || this.isSubmitting
          || !this.draft.emailOrUsername
          || !this.draft.resetCode;

        return this.control.renderCommon({
          title: "Enter reset code",
          copy: "Enter your password reset code.",
          submitAction: this.handleResetCodeSubmit,
          submitDisabled: resetCodeActionDisabled,
          submitLabel: "Verify code",
          backAction: this.handleBackClick,
        }, <>
          <div class="login-fields">
            {!this.serverState?.emailEnabled &&
              this.forgotPasswordFields.map((field) => this.control.renderField(field))
            }
            {this.resetCodeFields.map((field) => this.control.renderField(field))}
          </div>
          {adminCode && renderCallout("Email services are not setup. Ask an admin for a reset code.")}
        </>);
      }
      // #region update
      case "update-password": {

        const updatePasswordActionDisabled = this.isSubmitting
          || !this.draft.newPassword
          || !this.draft.confirmNewPassword
          || this.draft.newPassword !== this.draft.confirmNewPassword;

        return this.control.renderCommon({
          title: "Update password",
          copy: "Choose a new password for your account.",
          submitAction: this.handleUpdatePasswordSubmit,
          submitDisabled: updatePasswordActionDisabled,
          submitLabel: "Update password",
          backAction: this.handleBackClick,
        }, <>
          <div class="login-fields">
            {renderCallout("Username: " + this.draft.username)}
            {this.updatePasswordFields.map((field) => this.control.renderField(field))}
          </div>
        </>);
      }
    }

  }

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