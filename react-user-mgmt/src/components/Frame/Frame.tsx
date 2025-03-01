
import { useState } from 'react';
import { IndexJson, useIndexJson } from '../../helpers/server-types';
import { useAsyncEffect } from '../../helpers/useAsyncEffect';
import Header from './Header';
import AnonConfigModal from './AnonConfigModal';
import Dashboard from '../Dashboard/Dashboard';
import UserManagement from '../UserList/UserManagement';
import ManageUser from '../UserEdit/ManageUser';
import { DataLoader } from '../../helpers/utils';

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

  const pages: [RegExp, any, string][] = [
    [/^\/$/, <Dashboard />, "Wikis Available Here"],
    [/^\/admin\/users\/?$/, <UserManagement />, "User Management"],
    [/\/admin\/users\/(\d+)$/, <ManageUser />, "Manage User"],
  ];

  const page = pages.find(([re]) => re.test(location.pathname));

  return <>
    <Header
      pageTitle={page ? page[2] : "TiddlyWiki"}
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

    {page ? <>{page[1]}</> : <div className="mws-error">Page not found</div>}


  </>
};


