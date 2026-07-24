import { addstyles, customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import {
  AdminRecord,
} from "./app";
import { FieldDefinition, IdString, FieldZodType, FieldType, Drafter } from "./definition/tabs";
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
    type: "search-multiselect",
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


type ProfileDraft = Drafter<typeof profileFields> & Drafter<typeof updatePasswordFields>;

type LoginServerState = {
  csrfToken: string;
  emailEnabled: boolean;
};

const renderCallout = (content: JSX.Node) => <div class="field-callout"><p>{content}</p></div>;

@addstyles(css)
@customElement("mws-profile-form")
export class ProfileForm extends JSXElement {
  // AGENTS: When the user edits this class directly, treat those changes as intentional and
  // important signals about desired behavior unless they explicitly ask to remove them.
  useLightDOM: boolean = true;
  constructor() { super(); }

  control: FomController<ProfileDraft> = new FomController<ProfileDraft>(this);

  handleAnySubmit: FomController<ProfileDraft>["handleAnySubmit"] = (...args) => this.control.handleAnySubmit(...args)

  onCancel = async () => {
    location.pathname = pathPrefix + "/";
  }

  @state() accessor props!: {}

  // #region state
  @state() accessor draft: ProfileDraft = this.createDraft();

  @state() private accessor mode: "profile" | "updatePassword" = "profile";
  @state() private accessor isSubmitting: boolean = false;
  @state() private accessor submitMessage: string = new URLSearchParams(globalThis.location?.search ?? "").get("state") === "password-changed"
    ? "Password updated. You can now log in."
    : "";


  private createDraft(): ProfileDraft {
    return {
      id: new IdString(""),
      email: "",
      username: "",
      roles: [],
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    };
  }

  protected render() {
    switch (this.mode) {
      case "profile": {

        return this.control.renderCommon({
          title: "User Profile",
          copy: "View your profile.",
          submitAction: this.handleProfileSubmit,
          submitDisabled: false,
          submitLabel: "Update Password",
          backAction: this.onCancel,
          backLabel: "Close",
        }, <>
          <div class="login-fields">
            {profileFields.map((field) => this.control.renderField(field))}
          </div>
        </>);

      } break;


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
          backAction: async () => { this.mode = "profile"; },
        }, <>
          <div class="login-fields">
            {updatePasswordFields.map((field) => this.control.renderField(field))}
          </div>
        </>);
      }

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



