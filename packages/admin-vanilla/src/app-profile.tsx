import { customElement, state } from "@tiddlywiki/jsx-lit";
import { AccountForm, AccountPage } from "./app-account";
import { EditTextInput } from "./app-edit-pages.tsx";
import { FormControl, FormGroup } from "./app-forms";
import { EditorField } from "./app-shell";
import { changeExistingPasswordWithPassword } from "./passwords";

type ProfilePasswordValues = {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
};

@customElement("mws-profile-form")
export class ProfileForm extends AccountForm<ProfilePasswordValues> {
  // AGENTS: When the user edits this class directly, treat those changes as intentional and
  // important signals about desired behavior unless they explicitly ask to remove them.
  protected readonly form = new FormGroup<ProfilePasswordValues>({
    password: new FormControl(""),
    newPassword: new FormControl(""),
    confirmNewPassword: new FormControl(""),
  });
  @state() private accessor mode: "profile" | "updatePassword" = "profile";

  private readonly onCancel = () => {
    location.pathname = pathPrefix + "/";
  };

  protected render() {
    this.observeForm();
    const controls = this.form.controls;
    const value = this.form.value;
    const user = embeddedServerResponse.userState;
    switch (this.mode) {
      case "profile":
        return <AccountPage
          title="User Profile"
          busy={this.isSubmitting}
          onSubmit={this.handleProfileSubmit}
          renderFeedback={this.renderFeedback}
          renderContent={() => <div class="login-fields">
            <EditorField
              title="Username"
              renderContent={() => <div class="field-value">{user.username}</div>}
            />
            <EditorField
              title="Email"
              renderContent={() => <div class="field-value is-empty">Not implemented</div>}
            />
            <EditorField
              title="Roles"
              renderContent={() => user.roles.length
                ? <ul class="value-list">
                  {user.roles.map((role) => <li>{role.role_name}</li>)}
                </ul>
                : <div class="field-value is-empty">None</div>}
            />
          </div>}
          renderActions={() => <footer class="login-actions">
            <div class="login-action-row">
              <button
                class="ghost-button"
                type="button"
                disabled={this.isSubmitting}
                onclick={this.onCancel}
              >Close</button>
              <button
                class="primary-button login-submit"
                type="submit"
                disabled={this.isSubmitting}
              >Update Password</button>
            </div>
          </footer>}
        />;
      case "updatePassword":
        return <AccountPage
          title="Update password"
          busy={this.isSubmitting}
          onSubmit={this.handleUpdatePasswordSubmit}
          renderFeedback={this.renderFeedback}
          renderContent={() => <div class="login-fields">
            <EditorField
              title="Current password"
              inputId="profile-password"
              renderContent={() => <EditTextInput
                inputId="profile-password"
                control={controls.password}
                type="password"
                autocomplete="current-password"
              />}
            />
            <EditorField
              title="New password"
              inputId="profile-newPassword"
              renderContent={() => <EditTextInput
                inputId="profile-newPassword"
                control={controls.newPassword}
                type="password"
                autocomplete="new-password"
              />}
            />
            <EditorField
              title="Confirm new password"
              inputId="profile-confirmNewPassword"
              renderContent={() => <EditTextInput
                inputId="profile-confirmNewPassword"
                control={controls.confirmNewPassword}
                type="password"
                autocomplete="new-password"
              />}
            />
          </div>}
          renderActions={() => <footer class="login-actions">
            <div class="login-action-row">
              <button
                class="ghost-button"
                type="button"
                disabled={this.isSubmitting}
                onclick={() => { this.mode = "profile"; }}
              >Cancel</button>
              <button
                class="primary-button login-submit"
                type="submit"
                disabled={this.isSubmitting || !value.password || !value.newPassword
                  || !value.confirmNewPassword || value.newPassword !== value.confirmNewPassword}
              >Update password</button>
            </div>
          </footer>}
        />;
    }
  }

  private readonly handleProfileSubmit = async () => {
    await this.handleAnySubmit(
      "Update password",
      "",
      async () => {
        this.mode = "updatePassword";
        return true;
      }
    );
  }

  private readonly handleUpdatePasswordSubmit = async (): Promise<void> => {
    const { password, newPassword, confirmNewPassword } = this.form.value;

    if (!password) {
      this.submitMessage = "Enter your current password.";
      return;
    }

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

  private submitUpdatePassword = async (): Promise<boolean> => {
    const clientState = this.form.value;
    await changeExistingPasswordWithPassword({
      username: embeddedServerResponse.userState.username,
      password: clientState.password,
      newPassword: clientState.newPassword,
    });
    location.search = "?state=password-changed";
    return new Promise(() => { });
  }

}



