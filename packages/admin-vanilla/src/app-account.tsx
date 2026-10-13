import { customElement, JSXElement, state } from "@tiddlywiki/jsx-lit";
import { Subscription } from "rxjs";
import { FormGroup } from "./app-forms";
import type { RenderContent } from "./app-shell";

interface AccountPageProps {
  title: string;
  description?: string;
  busy: boolean;
  onSubmit: () => void | Promise<void>;
  renderContent: RenderContent;
  renderFeedback: RenderContent;
  renderActions: RenderContent;
}

@customElement("mws-account-page")
export class AccountPage extends JSXElement {
  useLightDOM = true;
  @state() accessor props!: AccountPageProps;

  protected render() {
    const {
      title, description, busy, onSubmit,
      renderContent, renderFeedback, renderActions,
    } = this.props;
    return <div class="admin-shell">
      <section class="modal-card" aria-label={title}
        aria-busy={busy ? "true" : "false"}
        style="max-width: 30rem; margin: 0 auto; width: 100%;">
        <header class="login-card-header">
          <div class="login-card-title">
            <h3>{title}</h3>
            {description ? <p class="login-card-copy">{description}</p> : null}
          </div>
        </header>
        <form class="login-card-body" onsubmit={(event) => {
          event.preventDefault();
          if (!busy) void onSubmit();
        }}>
          {renderContent()}
          {renderFeedback()}
          {renderActions()}
        </form>
      </section>
    </div>;
  }
}

export abstract class AccountForm<Value extends object> extends JSXElement {
  useLightDOM = true;
  protected abstract readonly form: FormGroup<Value>;
  @state() protected accessor isSubmitting = false;
  @state() protected accessor submitMessage = new URLSearchParams(
    globalThis.location?.search ?? "",
  ).get("state") === "password-changed"
    ? "Password updated. You can now log in."
    : "";

  protected observeForm(): void {
    this.useEffect(() => {
      const subscription = new Subscription();
      for (const key of Object.keys(this.form.controls) as (keyof Value)[]) {
        subscription.add(this.form.controls[key].subscribe(() => this.requestUpdate()));
      }
      return subscription;
    }, [this.form]);
  }

  protected readonly renderFeedback = () => this.submitMessage
    ? <div class="login-feedback" role="status" aria-live="polite">
      {this.submitMessage.split("\n").map((message) => <p>{message}</p>)}
    </div>
    : null;

  protected async handleAnySubmit(
    message: string, failed: string, submit: () => Promise<boolean>,
  ): Promise<void> {
    if (this.isSubmitting || this.form.disabled) return;
    this.isSubmitting = true;
    this.submitMessage = message;
    this.form.disable();
    try {
      if (!await submit()) this.submitMessage = failed;
    } catch (error) {
      this.submitMessage = error instanceof Error ? error.message : failed;
      if (error instanceof Error) {
        try {
          const response = JSON.parse(error.message);
          if (response?.reason && response.status) {
            this.submitMessage = String(response.reason);
            if (response.details) {
              this.submitMessage += Object.entries(response.details)
                .map(([key, value]) => `\n${key}: ${value}`).join("");
            }
          }
        } catch {}
      }
    } finally {
      this.form.enable();
      this.isSubmitting = false;
    }
  }
}