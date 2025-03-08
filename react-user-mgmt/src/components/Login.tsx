import { useState } from 'react';
import { fetchPostSearchParams, useIndexJson } from '../helpers/utils';
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

  const [index] = useIndexJson();
  const isLoggedIn = !!index.isLoggedIn;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const returnUrl = new URLSearchParams(location.search).get('returnUrl') || '/';

  const handleSubmit = async (formData: FormData) => {

    setErrorMessage(null);

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password)
      return setErrorMessage('Please enter a username and password.');

    await loginWithOpaque(username, password).then(e => {
      location.href = "/";
    }, e => {
      setErrorMessage(`${e}`);
    });

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
