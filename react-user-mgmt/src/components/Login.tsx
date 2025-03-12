import { useState } from 'react';
import { useIndexJson } from '../helpers/utils';
import * as opaque from "@serenity-kit/opaque";
// import Form from '@rjsf/mui';
// import Form from "@rjsf/semantic-ui";
// import Form from "@rjsf/fluentui-rc";
// import validator from '@rjsf/validator-ajv8';
import Card from '@mui/material/Card';
import { Alert, CardContent, CardHeader, Container, Stack } from '@mui/material';
import { JsonForm } from '../helpers/forms';


export function fetchPostJSON(url: string, formData: any) {
  return fetch(url, {
    method: 'POST',
    redirect: "manual",
    headers: {
      'Content-Type': 'application/json',
      "X-Requested-With": "TiddlyWiki"
    },
    body: JSON.stringify(formData),
  });
}

export async function logout() {
  await fetchPostJSON('/logout', undefined);
}

const LOGIN_FAILED = 'Login failed. Please check your credentials.';

async function loginWithOpaque(username: string, password: string) {

  const { clientLoginState, startLoginRequest } = opaque.client.startLogin({ password });

  const login1 = await fetchPostJSON('/login/1', { username, startLoginRequest });

  if (!login1.ok) throw await login1.text() || LOGIN_FAILED;

  const { loginResponse } = await login1.json();

  const loginResult = opaque.client.finishLogin({ clientLoginState, loginResponse, password, });

  if (!loginResult) throw LOGIN_FAILED;

  const { finishLoginRequest, sessionKey, exportKey, serverStaticPublicKey } = loginResult;

  const login2 = await fetchPostJSON('/login/2', { username, finishLoginRequest });

  if (!login2.ok) throw await login2.text() || LOGIN_FAILED;

  return { username, sessionKey, exportKey, serverStaticPublicKey };

}

const Login: React.FC<{}> = () => {

  const [index] = useIndexJson();
  const isLoggedIn = !!index.isLoggedIn;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const returnUrl = new URLSearchParams(location.search).get('returnUrl') || '/';

  const handleSubmit = async (formData: { username: string, password: string, returnUrl: string }) => {

    setErrorMessage(null);
    console.log(formData);

    const { username, password } = formData

    if (!username || !password)
      return setErrorMessage('Please enter a username and password.');

    await loginWithOpaque(username, password).then(e => {
      location.href = returnUrl || "/";
    }, e => {
      setErrorMessage(`${e}`);
    });

  };

  return (
    <Stack spacing={2} justifyContent="center" alignItems="center" height="100vh">
      <Container maxWidth="sm" >
        <Card>
          <CardContent>
            <div className="login-header">
              <h1>Be our Guest</h1>
              <a href="/">Explore as Guest</a>
              <h2>TiddlyWiki Login</h2>
            </div>
            <JsonForm
              required={["username", "password"]}
              properties={{
                returnUrl: { type: "string", default: "/dashboard", "ui:widget": "hidden" },
                username: { type: "string", title: "Username" },
                password: { type: "string", title: "Password", "ui:widget": "password" }
              }}
              onSubmit={async (data, event) => {
                await handleSubmit(data.formData);
                return "";
              }}
            />
            <Stack paddingBlock={2}>
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Stack>
  );

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Be our Guest</h1>
          <a href="/">Explore as Guest</a>
          <h2>TiddlyWiki Login</h2>
        </div>

        {/* {isLoggedIn ? <>
          <div className="mws-success-message">You are logged in!</div>
        </> : <>
          <form className="login-form" action={handleSubmit}>
            <input type="hidden" name="returnUrl" value={returnUrl} />
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <input type="submit" value="Log In" />
          </form>
        </>} */}

        {errorMessage && (<div className="mws-error-message">{errorMessage}</div>)}
      </div>
    </div>
  );
};

export default Login;
