import { addstyles, customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import {
  AdminRecord,
} from "./app";
import { FieldDefinition, IdString, FieldTypeCreateValue, FieldType, Drafter } from "./definition/tabs";
import css from "./app.inline.css";
import { changeExistingPasswordWithCode, changeExistingPasswordWithPassword, loginWithOpaque, serverAcceptResetCode } from "./passwords";
import { FomController } from "./FomController";

const profileFields = [
  {
    key: "username",
    label: "Username",
    type: "string",
    mode: "server",
  },
  {
    key: "email",
    label: "Email",
    type: "string",
    mode: "server",
  },
  {
    key: "roles",
    label: "Roles",
    type: "permission-table",
    mode: "server"
  }
] as const satisfies FieldDefinition[];

const updatePasswordFields = [

  {
    key: "password",
    label: "Current password",
    type: "enter-password",
    mode: "create",
  },
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
] as const satisfies FieldDefinition[];



type ProfileDraft = Drafter<typeof profileFields>;
type UpdatePasswordDraft = Drafter<typeof updatePasswordFields>;

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

  control: FomController<UpdatePasswordDraft> = new FomController<UpdatePasswordDraft>(this);

  handleAnySubmit: FomController<UpdatePasswordDraft>["handleAnySubmit"] = (...args) => this.control.handleAnySubmit(...args)


  // #region state
  @state() accessor draft: UpdatePasswordDraft = this.createDraft();

  @state() private accessor mode: "profile" | "updatePassword" = "updatePassword";
  @state() private accessor isSubmitting: boolean = false;
  @state() private accessor isResolvingServerState: boolean = false;
  @state() private accessor rememberMe: boolean = false;
  @state() private accessor serverState: LoginServerState | null = null;
  @state() private accessor submitMessage: string = new URLSearchParams(globalThis.location?.search ?? "").get("state") === "password-changed"
    ? "Password updated. You can now log in."
    : "";


  private createDraft(): UpdatePasswordDraft {
    return {
      id: new IdString(""),
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    };
  }

  protected render() {
    switch (this.mode) {
      // #region login
      case "updatePassword": {

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
          isStart: true,
          handleBackClick: async () => { },
        }, <>
          <div class="login-fields">
            {updatePasswordFields.map((field) => this.control.renderField(field))}
          </div>
        </>);
      }

    }

  }

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

  private submitUpdatePassword = async (): Promise<boolean> => {
    const clientState = this.draft;
    await changeExistingPasswordWithPassword({
      username: embeddedServerResponse.userState.username,
      password: clientState.password,
      newPassword: clientState.newPassword,
    });
    location.search = "?state=password-changed";
    return new Promise(() => { });
  }

}



