
import { PropsWithChildren, ReactNode, useState } from 'react';
import Header from './Header';

import { Dashboard } from '../Dashboard/Dashboard';
import UserManagement from '../UserList/UserManagement';
import ManageUser from '../UserEdit/ManageUser';
import { useIndexJson } from '../../helpers/utils';
import { UsersScreen } from '../Users';
import { ErrorBoundary } from 'react-error-boundary';
import { Container, Stack } from '@mui/material';


export const Frame = (props: {}) => {

  const [indexJson, refresh] = useIndexJson();

  const username = indexJson?.username;
  const userIsAdmin = indexJson?.isAdmin || false;
  const userIsLoggedIn = !!indexJson.isLoggedIn;
  const user = indexJson;

  const pages: [RegExp, (args: string[]) => ReactNode, string][] = [
    [/^\/$/, () => <Dashboard />, "Wikis Available Here"],
    [/^\/admin\/users\/?$/, () => <UserManagement />, "User Management"],
    [/^\/admin\/users\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/, ([, user_id]) => <ManageUser userID={user_id} />, "Manage User"],
    [/^\/admin\/roles$/, () => <UsersScreen />, "Roles"],
  ];
  const route = location.pathname.slice(pathPrefix.length);
  const matches = pages.map(([re]) => re.exec(route));
  const index = matches.findIndex(m => m !== null);
  const page = index > -1 && pages[index][1](matches[index]!) || null;

  return (
    <>
      <Header
        pageTitle={page ? pages[index][2] : "TiddlyWiki"}
        username={username}
        userIsAdmin={userIsAdmin}
        userIsLoggedIn={userIsLoggedIn}
        userId={user?.user_id}
      />

      {/* {firstGuestUser && (
        <div className="mws-security-warning">
          <div className="mws-security-warning-content">
            <div className="mws-security-warning-icon">⚠️</div>
            <div className="mws-security-warning-text">
              <strong>Warning:</strong> TiddlyWiki is currently running in anonymous access mode which allows anyone with access to the server to read and modify data.
            </div>
            <div className="mws-security-warning-action">
              <a href="/admin/users" className="mws-security-warning-button">Add Admin Account</a>
            </div>
          </div>
        </div>
      )} */}
      <ErrorBoundary fallback={<Message>An error occured</Message>}>
        {page ?? <Message>Page not found</Message>}
      </ErrorBoundary>
    </>
  )
};

function Message({ children }: PropsWithChildren<{}>) {
  return <Stack alignItems="center" direction="column" padding={8} >{children}</Stack>

}

