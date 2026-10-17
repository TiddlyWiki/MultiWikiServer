import { customElement, state } from "@tiddlywiki/jsx-lit";
import { AccountForm, AccountPage } from "./app-account";
import { EditTextInput } from "./app-edit-pages.tsx";
import { FormControl, FormGroup } from "./app-forms";
import { EditorField } from "./app-shell";
import { changeExistingPasswordWithCode, loginWithOpaque, serverAcceptResetCode } from "./passwords";

type LoginFormMode = "login" | "forgot-password" | "reset-code" | "update-password";

type LoginValues = {
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

@customElement("mws-login-form")
export class LoginForm extends AccountForm<LoginValues> {
  // AGENTS: When the user edits this class directly, treat those changes as intentional and
  // important signals about desired behavior unless they explicitly ask to remove them.
  protected readonly form = new FormGroup<LoginValues>({
    username: new FormControl(""),
    password: new FormControl(""),
    emailOrUsername: new FormControl(""),
    resetCode: new FormControl(""),
    newPassword: new FormControl(""),
    confirmNewPassword: new FormControl(""),
  });
  @state() private accessor mode: LoginFormMode = "login";
  @state() private accessor isResolvingServerState: boolean = false;
  @state() private accessor rememberMe: boolean = false;
  @state() private accessor serverState: LoginServerState | null = null;
  private resetUserId = "";

  private serverStatePromise: Promise<LoginServerState> | null = null;

  connectedCallback() {
    super.connectedCallback();
    void this.ensureServerState().catch((error) => {
      this.submitMessage = error instanceof Error ? error.message : "Unable to load server state.";
    });
  }

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
    if (this.isResolvingServerState || !this.form.value.emailOrUsername) return;
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
    if (this.isResolvingServerState || !this.form.value.emailOrUsername
      || !this.form.value.resetCode) return;
    await this.handleAnySubmit(
      "Verifying reset code…",
      "Reset code failed.",
      () => this.submitResetCode()
    );
  };

  private readonly handleUpdatePasswordSubmit = async (): Promise<void> => {
    const { newPassword, confirmNewPassword } = this.form.value;

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


  private renderActions(label: string, disabled: boolean, showBack = true) {
    const submit = <button class="primary-button login-submit" type="submit"
      disabled={disabled}>{label}</button>;
    return showBack ? <footer class="login-actions">
      <div class="login-action-row">
        <button class="ghost-button" type="button"
          disabled={this.isSubmitting || this.isResolvingServerState}
          onclick={this.handleBackClick}>Cancel</button>
        {submit}
      </div>
    </footer> : submit;
  }

  protected render() {
    this.observeForm();
    const controls = this.form.controls;
    const value = this.form.value;
    const busy = this.isSubmitting || this.isResolvingServerState;
    switch (this.mode) {
      case "login": return <AccountPage
        title="Log in"
        busy={this.isSubmitting}
        onSubmit={this.handleLoginSubmit}
        renderFeedback={this.renderFeedback}
        renderContent={() => <>
          <div class="login-fields">
            <EditorField
              title="Username" inputId="login-username"
              renderContent={() => <EditTextInput inputId="login-username"
                control={controls.username} autocomplete="username"
              />}
            />
            <EditorField
              title="Password" inputId="login-password"
              renderContent={() => <EditTextInput inputId="login-password"
                control={controls.password} type="password"
                autocomplete="current-password"
              />}
            />
          </div>
          <div class="login-options" aria-label="Login options">
            {/* 
            <label class="login-checkbox" for="login-remember-me">
              <input id="login-remember-me" class="login-checkbox-input"
                type="checkbox" checked={this.rememberMe}
                disabled={this.isSubmitting}
                ref={(element) => { element.checked = this.rememberMe; }}
                onchange={(event) => { this.rememberMe = event.currentTarget.checked; }} />
              <span>Remember me</span>
            </label>
            */}
            <button class="login-link-button" type="button"
              disabled={this.isSubmitting}
              onclick={this.handleForgotPasswordClick}>Forgot password?</button>
          </div>
        </>}
        renderActions={() => this.renderActions(
          this.isSubmitting ? "Logging in..." : "Log in", this.isSubmitting, false)}
      />;
      case "forgot-password": return <AccountPage
        title="Forgot password"
        busy={busy}
        onSubmit={this.handleForgotPasswordSubmit}
        renderFeedback={this.renderFeedback}
        renderContent={() => this.isResolvingServerState
          ? <div class="modal-loading-shell">
            <div class="modal-loading-bar" aria-hidden="true"><span></span></div>
            <p class="modal-loading-copy" role="status">Loading server state...</p>
          </div>
          : <div class="login-fields">
            <EditorField
              title="Email / username" inputId="login-emailOrUsername"
              renderContent={() => <EditTextInput
                inputId="login-emailOrUsername"
                control={controls.emailOrUsername}
                autocomplete="username"
              />}
            />
          </div>}
        renderActions={() => this.renderActions(
          !this.serverState || this.serverState.emailEnabled ? "Send Email" : "Enter Code",
          busy || !value.emailOrUsername)}
      />;
      case "reset-code": return <AccountPage
        title="Enter reset code"
        busy={busy} onSubmit={this.handleResetCodeSubmit}
        renderFeedback={this.renderFeedback}
        renderContent={() => <>
          <div class="login-fields">
            {!this.serverState?.emailEnabled ? <EditorField
              title="Email / username"
              inputId="login-emailOrUsername"
              renderContent={() => <EditTextInput
                inputId="login-emailOrUsername"
                control={controls.emailOrUsername}
                autocomplete="username"
              />}
            /> : null}
            <EditorField
              title="Reset code"
              inputId="login-resetCode"
              renderContent={() => <EditTextInput
                inputId="login-resetCode"
                control={controls.resetCode}
              />}
            />
          </div>
          {this.serverState && !this.serverState.emailEnabled
            ? renderCallout("Email services are not setup. Ask an admin for a reset code.")
            : null}
        </>}
        renderActions={() => this.renderActions("Verify code",
          busy || !value.emailOrUsername || !value.resetCode)}
      />;
      case "update-password": return <AccountPage
        title="Update password"
        busy={this.isSubmitting} onSubmit={this.handleUpdatePasswordSubmit}
        renderFeedback={this.renderFeedback}
        renderContent={() => <div class="login-fields">
          {renderCallout("Username: " + value.username)}
          <EditorField
            title="New password"
            inputId="login-newPassword"
            renderContent={() => <EditTextInput
              inputId="login-newPassword"
              control={controls.newPassword}
              type="password"
              autocomplete="new-password"
            />}
          />
          <EditorField title="Confirm new password"
            inputId="login-confirmNewPassword"
            renderContent={() => <EditTextInput
              inputId="login-confirmNewPassword"
              control={controls.confirmNewPassword}
              type="password"
              autocomplete="new-password"
            />}
          />
        </div>}
        renderActions={() => this.renderActions("Update password",
          this.isSubmitting || !value.newPassword || !value.confirmNewPassword
          || value.newPassword !== value.confirmNewPassword)}
      />;
    }
  }

  private submitLogin = async (): Promise<boolean> => {
    await this.ensureServerState();
    const clientState = this.form.value;
    await loginWithOpaque(clientState.username, clientState.password, true);
    location.href = location.origin + pathPrefix + "/";
    return new Promise(() => { }); // hang since the page is already loading
  }
  private submitForgotPassword = async (): Promise<boolean> => {
    await this.ensureServerState();
    this.mode = "reset-code";
    this.submitMessage = "";
    return true;
  }
  private submitResetCode = async (): Promise<boolean> => {
    const serverState = await this.ensureServerState();
    const clientState = this.form.value;
    const { user_id, username } = await serverAcceptResetCode({
      resetCode: clientState.resetCode,
      csrfToken: serverState.csrfToken,
      emailOrUsername: clientState.emailOrUsername,
    });
    this.resetUserId = user_id;
    this.form.controls.username.setValue(username);
    this.mode = "update-password";
    this.submitMessage = "";
    return true;
  }
  private submitUpdatePassword = async (): Promise<boolean> => {
    await this.ensureServerState();
    const clientState = this.form.value;
    await changeExistingPasswordWithCode({
      user_id: this.resetUserId,
      username: clientState.username,
      resetCode: clientState.resetCode,
      newPassword: clientState.newPassword,
    });
    location.search = "?state=password-changed";
    return new Promise(() => { });
  }

  private async loadServerStateInternal(): Promise<LoginServerState> {
    await new Promise(r => { setTimeout(r, 2000); });
    return {
      csrfToken: "pretend-csrf-token",
      emailEnabled: false,
    };
  }

}