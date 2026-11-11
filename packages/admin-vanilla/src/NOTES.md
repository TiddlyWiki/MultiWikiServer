# Admin UI Notes

The `app-*.tsx` files contain the application UI and its orchestration logic.
The supporting `app-*.ts` files implement form state and construct admin forms.
These notes cover the account, admin, editor, form, shell, and tab-controller
files in this directory.

## Component Conventions

- Components extend `JSXElement` from `@tiddlywiki/jsx-lit`, register with
	`@customElement`, and use `@state() accessor` for reactive state and props.
- Most components use light DOM. `ModalView`, `EditPage`, and `FeedbackNotice`
	use shadow DOM with `@addstyles`; slots carry their external content.
- `RenderContent` is a `() => JSX.Node` callback. Shell components accept these
	callbacks so callers can supply content without owning the surrounding layout.
- Form-aware components subscribe in `useEffect` and request updates when their
	controls emit. Effects return subscriptions or cleanup functions.
- Browser globals provide deployment and session context: `pathPrefix` and
	`embeddedServerResponse` supply routes, the page token, user state, and
	available TiddlyWiki versions.

## Shared Form State

### app-forms.ts

Defines the reactive form model, independent of the UI components:

- `FormControl<Value>` stores a value, validators, validation errors, and its own
	disabled, touched, and dirty flags. Notifications use RxJS `Subject` and
	`Subscription`.
- Each control has at most one parent. Adoption rejects duplicate controls,
	controls that already have a parent, and ancestor cycles.
- Disabled state is inherited from parents. Touched and dirty state aggregate
	upward from children. Marking a container untouched or pristine also resets
	its descendants.
- Value changes emit on the control and normally notify its ancestors.
	`callNotify = false` suppresses upward notification, not the control's own
	value emission. Marking touched or dirty with `false` changes flags silently.
- Enabling or disabling a container emits through its descendants so inputs can
	update their effective disabled state. It preserves each child's own flag.
- `checkValidity()` runs validators and records `validatorErrors`; disabled
	controls clear their own errors and count as valid. Validation is explicit,
	not automatically triggered by value changes.
- `FormGroup<Value>` owns named controls and computes an object value.
	`setValue()` requires every existing control's key; `patchValue()` updates
	matching keys only. Controls can be added or removed, although removing a
	required key does not change the group's static type.
- `FormArray<Value>` owns ordered controls and supports adding, removing, and
	repositioning them. `setValue()` requires the existing array length.
- Groups and arrays recursively check children and expose `childrenErrors`
	containing each direct child's own `validatorErrors`.

Disabled controls remain in `.value`. Disabling a form blocks editing; it does
not remove fields from the save payload. UI handlers explicitly mark edits dirty
and blur events touched; `setValue()` does neither automatically.

### app-edit-forms.ts

Constructs the five admin forms: `createWikiForm`, `createTemplateForm`,
`createBagForm`, `createRoleForm`, and `createUserForm`.

- Missing values receive defaults, including an empty `IdString` for new IDs.
- String collections become `FormArray<string>` instances. `prefixControl` and
	`permissionControl` construct nested groups for writable routing and bag ACLs.
- Wiki forms disable `templateName` in edit mode, preventing template changes
	through the editor while keeping the value in the submitted object.
- Template forms include version selection, routing, plugins, access roles,
	caching flags, and custom HTML injection settings.
- Bag forms include permissions; role forms include name and description; user
	forms include identity, roles, and a password-reset code.

These factories currently return `FormGroup<any>` and do not attach validators.
They edit a subset of the loaded record rather than all computed store fields.

## Shared UI

### app-shell.tsx

Contains layout and presentation components shared by admin and account pages:

- `PageSection` groups fields; `PageCard` supplies a titled field area with
	layout options and an optional header action or footer note.
- `EditorField` supplies a label, optional helper text, and field content.
	`CurrentSection` presents saved values in an editor sidebar.
- `ModalView` owns the backdrop and Web Animations opening/closing transitions.
	It makes closing content inert, honors reduced motion, cleans up animations
	on disconnect, and calls `onAfterClose` after the closing transition.
- `EditPage` consumes `EditPageModel`: title, mode, loading/saving state, error,
	and close/save/dismiss callbacks. Named slots provide `sidebar`, `editor`, and
	`preview` content. Sidebar visibility follows assigned elements.
- `EditPage` retains its last model during closing so the modal can animate out.
	Saving disables its close and action buttons and blocks backdrop dismissal.
- `ListPage` renders a heading, actions, and a list. A changed `pageId` triggers
	a brief fade out, content swap, and fade in; the leaving content is inert.
- `RichListItem` separates main content, metadata, and actions, or displays
	skeleton placeholders while records load.
- `FeedbackNotice` displays info, success, warning, or error feedback with a
	matching icon, slotted body, and optional dismissal. Errors use `role="alert"`;
	other tones use `role="status"`.
- `AppShell` renders the admin header, TiddlyWiki-version and account menus,
	feedback region, navigation, and main content. It closes account menus on
	outside clicks and removes its document listener on disconnect. Profile,
	version links, and logout use the embedded server context.

## Account Flows

### app-account.tsx

- `AccountPage` renders the shared account card and HTML form. Callers supply
	the title, optional description, busy flag, submit callback, fields, feedback,
	and actions. Submission prevents navigation and invokes the callback only
	when the page is not busy.
- `AccountForm<Value>` is the base class for login and profile forms. Subclasses
	provide a `FormGroup` and call `observeForm()` while rendering.
- `handleAnySubmit()` rejects overlapping submissions or a disabled form, sets
	progress feedback, disables the form, and runs an async boolean callback.
	A false result shows the fallback failure message. Thrown errors supply their
	message, with JSON-encoded `reason`, `status`, and `details` unpacked when
	present. The form is re-enabled in `finally`.
- Feedback is a polite live region with one paragraph per message line. A
	`state=password-changed` query parameter initializes the success message.

### app-login.tsx

`LoginForm` extends `AccountForm` with four modes: `login`, `forgot-password`,
`reset-code`, and `update-password`. One form retains all mode-specific values.

- Server-state loading starts on connection. `ensureServerState()` caches the
	result and shares an in-flight promise; recovery controls use its busy state.
- Login calls `loginWithOpaque(username, password, true)`, then navigates to the
	deployment root. The remember-me UI is commented out and the call always
	passes `true`.
- Forgot-password navigation consults `emailEnabled`. With email disabled it
	goes directly to reset-code entry, which also asks for email or username.
- Code verification calls `serverAcceptResetCode` with the code, identity, and
	CSRF token. The returned user ID and username prepare the password update.
- Password updates require two nonempty matching values and call
	`changeExistingPasswordWithCode`. Success reloads with
	`?state=password-changed`.
- Cancel steps back through recovery modes; the reset-code back action depends
	on whether email is enabled.

Current placeholders: `loadServerStateInternal()` waits two seconds and returns
`pretend-csrf-token` with email disabled. `submitForgotPassword()` only advances
to code entry and clears feedback; it does not send an email. Navigation-based
success paths return a never-settling promise to keep submission busy while the
browser leaves the page.

### app-profile.tsx

`ProfileForm` extends `AccountForm` with `profile` and `updatePassword` modes.

- The profile view shows the embedded user's username and role names. Email is
	explicitly displayed as not implemented. Close navigates to the deployment
	root; Update Password switches modes through the shared submission helper.
- Password entry requires the current password and matching nonempty new
	passwords. It calls `changeExistingPasswordWithPassword` with the embedded
	username, then reloads with `?state=password-changed`.
- Cancel returns to the profile view. Like login, successful navigation keeps
	the submission promise pending.

## Admin Records

### app-admin.tsx

`AppAdmin` owns loaded store data, loading errors, the current editor model,
editor render callbacks, and the selected saved record. `AppTabController`
provides its navigation and list content.

- On connection, missing data triggers `getStoreData()`. It fetches
	`<pathPrefix><admin route>/load` with the page-token bearer header and
	`X-Requested-With: TiddlyWiki`. There is currently an extra one-second delay
	before reading the response.
- A JSON reviver converts strings beginning with `IdString.prefix` into
	`IdString` instances. Load failures appear in a dismissible `FeedbackNotice`.
- `openCreate()` and `openEdit()` use `getEditPageRenders()` to construct a form
	and its views, then create an `EditPageModel`.
- Saving disables the form and sends its value through `saveStoreData()`.
	Callback-identity checks ensure an old save cannot mutate a different editor.
	Success closes the editor; failure retains it with an error; `finally`
	re-enables the form and clears saving state.
- Saves use JSON `PUT` requests to `<admin route>/save/<tabId>` with content-type
	and requested-with headers. Empty template versions are normalized to `null`.
- The returned record is revived and replaces the same ID in the active
	collection, or is appended for a new ID. Saving does not reload the complete
	store or refresh other collections' computed fields.
- `handleErrorResponse()` converts structured server failures into `SendError`
	and other failures into ordinary errors. Both loading and saving display
	errors through `SendError.errorString()`.

### app-edit-pages.tsx

Connects forms to reusable input components and record-specific editor views:

- `EditTextInput` binds a string control to an input or textarea, optionally
	with datalist suggestions. It supports explicit disabling, autocomplete,
	password/email types, and code-style multiline content.
- `EditToggle` binds a boolean checkbox. `EditPermissionLevel` binds the
	`A_read`, `B_write`, and `C_admin` permission values.
- `EditStringList`, `EditPrefixList`, and `EditPermissionList` render editable
	arrays with add/remove actions. A `WeakMap` gives each control a stable symbol
	key so row identity survives index changes.
- Input handlers guard disabled controls, mark edits dirty, update values, and
	mark controls touched on blur. List mutations also mark the array dirty.
- `textField()` and `stringList()` reduce repeated field composition.
- `EditCustomHtmlFields` watches the custom-HTML toggle and enables or disables
	the HTML content, injection function, and injection marker controls.
- `EditRoutingPreview` tests a title against nonempty bag targets using the
	longest matching prefix, falling back to the blank prefix. It trims the test
	title. `WikiRoutingPreview` combines template and wiki rules by prefix, with
	wiki rules overriding template rules; blank bag names are ignored.
- The five `render*Editor` functions compose fields for wikis, templates, bags,
	roles, and users. Wiki editing includes the live routing preview; template
	editing includes custom HTML; bag editing includes permission rows.
- Saved-value renderers show current values and relationships: effective wiki
	bags/plugins, template dependents, bag references, or role/user details.
- `getEditPageRenders()` dispatches on `PageId`, creates the matching form, builds
	lookup suggestions from loaded data and embedded versions, and returns
	`form`, `renderEditor`, and an optional `renderCurrent`. The interface also
	permits `renderPreview`, but no current case supplies it.

Save schemas are imported here, but the current editor/save flow does not call
them or `checkValidity()`. Datalists provide suggestions, not enforced choices.
The routing preview is client-side feedback, not a server routing request.

### app-tab-controller.tsx

`AppTabController` defines the five tabs: Wikis, Templates, Bags, Roles, and
Users. Each tab supplies labels, descriptions, create text, and a list renderer.

- `activeTab` uses the local `@requestUpdate` decorator to update the owning
	`AppAdmin` when navigation changes.
- `renderTabs()` renders navigation buttons and the divider before Roles.
- `renderListContent()` supplies a `ListPage`, create action, loading skeletons,
	empty state, or the active tab's records.
- Creation is disabled until data exists and loading finishes; record edit
	actions are disabled while loading. Both delegate editor opening to `AppAdmin`.
- Wiki entries link to their encoded slug and show effective routing/plugin
	counts. Templates show version, dependents, routing counts, and update time.
	Bags show ACLs and reference counts; roles show assigned-user counts; users
	show email and assigned roles.

## Main Data Paths

1. Admin load: `AppAdmin.getStoreData()` -> revived store data ->
	 `AppTabController` -> `ListPage` / `RichListItem`.
2. Admin edit: tab action -> `AppAdmin.openEditor()` -> `getEditPageRenders()` ->
	 form factory -> input subscriptions -> form values.
3. Admin save: `EditPageModel.onSave()` -> disabled form -> `saveStoreData()` ->
	 replace/append returned record -> close editor, or display the save error.
4. Account submit: `AccountPage` -> mode-specific handler ->
	 `AccountForm.handleAnySubmit()` -> password helper -> mode change or navigation.