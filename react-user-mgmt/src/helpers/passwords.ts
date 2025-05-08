
import { SessionManagerMap } from "../../../src/services/SessionManager";
import { serverRequest } from "./utils";
const LOGIN_FAILED = 'Login failed. Please check your credentials.';

export const sessionRequest: SessionManagerMap = {
  login1: sessionManager("login1", "/login/1"),
  login2: sessionManager("login2", "/login/2"),
  logout: sessionManager("logout", "/logout"),
}

function sessionManager<K extends keyof SessionManagerMap>(key: K, path: SessionManagerMap[K]["path"]) {
  const t = async (data: any) => {
    const req = await fetch(pathPrefix + path, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        "X-Requested-With": "TiddlyWiki"
      },
      body: JSON.stringify(data),
    });
    if (!req.ok) throw `${await req.text()}`;
    return await req.json();
  };
  t.path = path;
  t.key = key;
  return t;
}


function arrayBufferToBase64_viaBlob(buffer: ArrayBuffer) {
  return new Promise<string>((resolve, reject) => {
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result !== "string") return reject('Failed to read blob');
      // reader.result is "data:application/octet-stream;base64,AAAA…"
      const parts = reader.result.split(",");
      if (typeof parts[1] !== "string") return reject('Failed to read blob output');
      resolve(parts[1]);
    };
    reader.readAsDataURL(blob);
  });
}

async function generateSessionSignature(sessionKey: string, session_id: string & { __prisma_table: "Sessions"; __prisma_field: "session_id"; }) {
  const encoder = new TextEncoder();
  const data = encoder.encode(sessionKey + session_id);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  const signature = await arrayBufferToBase64_viaBlob(hash);
  return signature;
}

export async function createNewPassword({ user_id, password }: { user_id: string, password: string }) {

  const opaque = await import("@serenity-kit/opaque");

  await opaque.ready;

  const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({
    password
  });

  const registrationResponse = await serverRequest.user_update_password({
    user_id, registrationRequest
  });

  if (!registrationResponse) throw 'Failed to update password'; // wierd, but shouldn't happen

  const { registrationRecord } = opaque.client.finishRegistration({
    clientRegistrationState, registrationResponse, password
  });

  await serverRequest.user_update_password({
    user_id, registrationRecord
  });

}

export async function changeExistingPasswordAdmin({ user_id, newPassword }: { user_id: string, newPassword: string }) {
  const opaque = await import("@serenity-kit/opaque");

  await opaque.ready;

  const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password: newPassword });

  const registrationResponse = await serverRequest.user_update_password({
    user_id, registrationRequest
  });

  if (!registrationResponse) throw 'Failed to update password'; // wierd, but shouldn't happen

  const { registrationRecord } = opaque.client.finishRegistration({
    clientRegistrationState, registrationResponse, password: newPassword,
  });

  await serverRequest.user_update_password({ user_id, registrationRecord });

}

export async function changeExistingPassword({ username, password, newPassword }: {
  username: string;
  password: string;
  newPassword: string;
}) {

  const { user_id, session_id, sessionKey, opaque } = await loginWithOpaque(username, password);

  const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password: newPassword });

  const signature = await generateSessionSignature(sessionKey, session_id);

  const registrationResponse = await serverRequest.user_update_password({
    user_id, registrationRequest, session_id, signature
  });

  if (!registrationResponse) throw 'Failed to update password'; // wierd, but shouldn't happen

  const { registrationRecord } = opaque.client.finishRegistration({
    clientRegistrationState, registrationResponse, password: newPassword,
  });

  await serverRequest.user_update_password({ user_id, registrationRecord, session_id, signature });

  // this closes the login session we opened for the password change
  await sessionRequest.logout({ session_id, signature, skipCookie: true });

}




export async function loginWithOpaque(username: string, password: string, setCookie?: boolean) {

  const opaque = await import("@serenity-kit/opaque");

  await opaque.ready;

  const { clientLoginState, startLoginRequest } = opaque.client.startLogin({ password });

  const { loginResponse, loginSession } = await sessionRequest.login1({ username, startLoginRequest });

  const loginResult = opaque.client.finishLogin({ clientLoginState, loginResponse, password, });

  if (!loginResult) throw LOGIN_FAILED;

  const { finishLoginRequest, sessionKey, exportKey, serverStaticPublicKey } = loginResult;

  const { user_id, session_id } = await sessionRequest.login2({ finishLoginRequest, loginSession, skipCookie: !setCookie });

  return { user_id, session_id, username, sessionKey, exportKey, serverStaticPublicKey, opaque };

}
