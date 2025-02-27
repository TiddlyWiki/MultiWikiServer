import { useState } from 'react';
import { fetchPostSearchParams } from '../helpers/utils';
import { useAsyncEffect } from '../helpers/useAsyncEffect';
import * as opaque from "@serenity-kit/opaque";

const LOGIN_FAILED = 'Login failed. Please check your credentials.';

async function loginWithOpaque(username: string, password: string) {

  const { clientLoginState, startLoginRequest } = opaque.client.startLogin({ password });

  const login1 = await fetchPostSearchParams('/login/1', { username, startLoginRequest });

  if (!login1.ok) throw await login1.text() || LOGIN_FAILED;

  const loginResponse = await login1.text();

  const loginResult = opaque.client.finishLogin({ clientLoginState, loginResponse, password, });

  if (!loginResult) throw LOGIN_FAILED;

  const { finishLoginRequest, sessionKey, exportKey, serverStaticPublicKey } = loginResult;

  const login2 = await fetchPostSearchParams('/login/2', { username, finishLoginRequest });

  if (!login2.ok) throw await login2.text() || LOGIN_FAILED;

  return { username, sessionKey, exportKey, serverStaticPublicKey };

}

const Login: React.FC<{}> = () => {

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const returnUrl = new URLSearchParams(location.search).get('returnUrl') || '/';

  useAsyncEffect(async () => {

    const response = await fetch('/login.json', { method: 'GET' });
    const json = await response.json();
    await opaque.ready;
    setIsLoggedIn(json.isLoggedIn);
  }, undefined, undefined, []);


  const handleSubmit = async (formData: FormData) => {
    setErrorMessage(null);

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      setErrorMessage('Please enter a username and password.');
      return;
    }

    await loginWithOpaque(username, password).then(e => {
      setIsLoggedIn(true);
      console.log(e);
    }, e => {
      setErrorMessage(`${e}`);
    })
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Be our Guest</h1>
          <a href="/">Explore as Guest</a>
          <h2>TiddlyWiki Login</h2>
        </div>

        {isLoggedIn ? <>
          <div className="mws-success-message">You are logged in!</div>
        </> : <>
          <form className="login-form" action={handleSubmit}>
            <input type="hidden" name="returnUrl" value={returnUrl} />
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <input type="submit" value="Log In" />
          </form>
        </>}

        {errorMessage && (<div className="mws-error-message">{errorMessage}</div>)}
      </div>
    </div>
  );
};

export default Login;

async function* OPAQUE2(registrationRecord: string) {
  await opaque.ready;
  const serverSetup = opaque.server.createSetup();
  // client
  const password = "sup-krah.42-UOI"; // user password

  const { clientLoginState, startLoginRequest } = opaque.client.startLogin({ password });

  // server
  const userIdentifier = "20e14cd8-ab09-4f4b-87a8-06d2e2e9ff68"; // userId/email/username

  const { serverLoginState, loginResponse } = opaque.server.startLogin({
    serverSetup,
    userIdentifier,
    registrationRecord,
    startLoginRequest,
  });

  // client
  const loginResult = opaque.client.finishLogin({
    clientLoginState,
    loginResponse,
    password,
  });
  if (!loginResult) {
    throw new Error("Login failed");
  }
  const { finishLoginRequest, sessionKey } = loginResult;

  // server
  // the server session key is only returned after verifying the client's response, 
  // which validates that the client actually has the session key.
  const { sessionKey: serversessionkey } = opaque.server.finishLogin({
    finishLoginRequest,
    serverLoginState,
  });

  ok(sessionKey === serversessionkey);

}