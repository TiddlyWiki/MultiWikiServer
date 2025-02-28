import React, { useState, useEffect } from 'react';
import Header from './Header';
import { useAsyncEffect } from '../helpers/useAsyncEffect';
import AddUserForm from './AddUserForm';

interface User {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  last_login: string;
}

interface UserManagementResponse {
  "user-list": User[];
  "user-is-admin": boolean;
  "first-guest-user": boolean;
  username: string;
}

const UserManagement: React.FC = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [userIsAdmin, setUserIsAdmin] = useState<boolean>(false);
  const [firstGuestUser, setFirstGuestUser] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");

  useAsyncEffect(async () => {
    try {
      const response = await fetch('/admin/users.json');
      const data: UserManagementResponse = await response.json();
      setUserList(data["user-list"] || []);
      setUserIsAdmin(data["user-is-admin"] || false);
      setFirstGuestUser(data["first-guest-user"] || false);
      setUsername(data.username || "");
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, undefined, undefined, []);

  return (
    <>
      <div className="mws-users-container">
        {userList.length > 0 ? (
          <div className="mws-users-list">
            {userList.map((user) => (
              <a 
                key={user.user_id} 
                href={`/admin/users/${user.user_id}?q=preview`} 
                className="mws-user-item"
              >
                <div className="mws-user-info">
                  <span className="mws-user-name">
                    {user.username}
                  </span>
                  <span className="mws-user-email">
                    {user.email}
                  </span>
                </div>
                <div className="mws-user-details">
                  <span className="mws-user-created">
                    Created: {user.created_at}
                  </span>
                  <span className="mws-user-last-login">
                    Last Login: {user.last_login || 'Never'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="mws-no-users-message">
            No users found
          </div>
        )}
        
        {(userIsAdmin || firstGuestUser) && (
          <div className="mws-add-user-card">
            <AddUserForm />
          </div>
        )}
      </div>
    </>
  );
};

export default UserManagement;
