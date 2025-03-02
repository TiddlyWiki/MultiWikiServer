
import { ReactNode, useState } from 'react';
import { IndexJson, useIndexJson } from '../../helpers/server-types';
import { useAsyncEffect } from '../../helpers/useAsyncEffect';
import Header from './Header';
import AnonConfigModal from './AnonConfigModal';
import Dashboard from '../Dashboard/Dashboard';
import UserManagement from '../UserList/UserManagement';
import ManageUser from '../UserEdit/ManageUser';
import { DataLoader } from '../../helpers/utils';
import ManageAcl from '../ACL/ManageAcl';

export const Frame = (props: {}) => {

  const indexJson = useIndexJson();

  const username = indexJson.authUser?.username;
  const userIsAdmin = indexJson.authUser?.isAdmin || false;
  const userIsLoggedIn = !!indexJson.authUser;
  const firstGuestUser = indexJson.firstGuestUser;
  const user = indexJson.authUser;
  const allowReads = indexJson.allowReads;
  const allowWrites = indexJson.allowWrites;

  const [showAnonConfig, setShowAnonConfig] = useState(false);

  const pages: [RegExp, (e: RegExpExecArray) => ReactNode, string][] = [
    [/^\/$/, () => <Dashboard />, "Wikis Available Here"],
    [/^\/admin\/users\/?$/, () => <UserManagement />, "User Management"],
    [/\/admin\/users\/(\d+)$/, ([, user_id]) => <ManageUser userID={user_id}/>, "Manage User"],
    [
      /^\/admin\/acl\/([^\/]+)\/([^\/]+)/,
      ([, recipeName, bagName]) => <ManageAcl
        recipeName={decodeURIComponent(recipeName) as string}
        bagName={decodeURIComponent(bagName) as string}
      />,
      "ACL Management"],

  ];

  const matches = pages.map(([re]) => re.exec(location.pathname));
  const index = matches.findIndex(m => m !== null);
  const page = index > -1 && pages[index][1](matches[index]!) || null;

  return <>
    <Header
      pageTitle={page ? pages[index][2] : "TiddlyWiki"}
      username={username}
      userIsAdmin={userIsAdmin}
      userIsLoggedIn={userIsLoggedIn}
      firstGuestUser={firstGuestUser}
      userId={user?.user_id}
      setShowAnonConfig={setShowAnonConfig}
    />

    {firstGuestUser && (
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
    )}

    {showAnonConfig && (
      <AnonConfigModal
        initialAllowReads={allowReads}
        initialAllowWrites={allowWrites}
        onClose={() => setShowAnonConfig(false)}
      />
    )}

    {page ?? <div className="mws-error">Page not found</div>}


  </>
};


