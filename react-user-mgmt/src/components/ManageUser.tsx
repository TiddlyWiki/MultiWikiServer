import React, { useState } from 'react';
import Header from './Header';
import { useAsyncEffect } from '../helpers/useAsyncEffect';
import { changePassword, fetchPostSearchParams } from '../helpers/utils';


interface Role {
  role_id: string;
  role_name: string;
}

interface User {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  last_login: string;
}

interface UserRole {
  role_id: string;
  role_name: string;
  description: string;
}

interface ManageUserProps {
  user: User;
  userRole: UserRole;
  allRoles: Role[];
  userIsAdmin: boolean;
  isCurrentUserProfile: boolean;
  username?: string;
  firstGuestUser?: boolean;
  userIsLoggedIn?: boolean;
  setRefreshData: (data: {}) => void;
}

interface UserJson {
  "page-content": string;
  user: string;
  "user-initials": string;
  "user-role": string;
  "all-roles": string;
  "user-id": never;
  "first-guest-user": "yes" | "no";
  "is-current-user-profile": "yes" | "no";
  username: string;
  "user-is-admin": "yes" | "no";
  "user-is-logged-in": "yes" | "no";
  "has-profile-access": "yes" | "no";

}

export default function ManageUser() {
  const [refreshData, setRefreshData] = useState({});
  const [result, setResult] = useState<UserJson | null>(null);

  useAsyncEffect(async () => {
    const res = await fetch(location.pathname + ".json", {});
    if (res.status !== 200) throw new Error("Failed to fetch user data");
    setResult(await res.json());
  }, undefined, undefined, [refreshData]);

  if (!result) return null;

  return <ManageUserInner {...{
    user: JSON.parse(result.user),
    userRole: JSON.parse(result["user-role"]).roles[0],
    allRoles: JSON.parse(result["all-roles"]),
    userIsAdmin: result["user-is-admin"] === "yes",
    isCurrentUserProfile: result["is-current-user-profile"] === "yes",
    username: result.username,
    firstGuestUser: result["first-guest-user"] === "yes",
    userIsLoggedIn: result["user-is-logged-in"] === "yes",
    setRefreshData
  }} />

}


const ManageUserInner: React.FC<ManageUserProps> = ({
  user,
  userRole,
  allRoles,
  userIsAdmin,
  isCurrentUserProfile,
  username,
  firstGuestUser = false,
  userIsLoggedIn = true,
  setRefreshData
}) => {
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const userInitials = user.username?.[0].toUpperCase();

  const handler = (endpoint: string, success: (msg: string) => void, error: (msg: string) => void) =>
    async (formData: FormData) => {
      const res = await fetchPostSearchParams(endpoint, formData);
      const body = await res.text();

      if (!res.ok)
        error(body);
      else {
        success(body);
        setRefreshData({});
      }
    }

  const handleUpdateProfile = handler('/update-user-profile', setUpdateSuccess, setUpdateError);


  const handleDeleteAccount = async (formData: FormData) => {
    if (window.confirm('Are you sure you want to delete this user account? This action cannot be undone.'))
      await handler('/delete-user-account', () => location.pathname = '/admin/users', setDeleteError)(formData);
  };

  const handleChangePassword = async (formData: FormData) => {
    const userId = formData.get("userId") as string;
    const password = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword");
    if (!userId || !password || !confirmPassword) throw false;

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      throw false;
    }

    await changePassword(userId, password).then(() => {
      setPasswordSuccess("Password successfully changed.");
      setRefreshData({});
    }).catch(e => {
      setPasswordError(`${e}`);
      throw false;
    });

  }

  return (
    <>

      <div className="mws-main-wrapper">
        <div className="mws-user-profile-container">
          <div className="mws-user-profile-header">
            <div className="mws-user-profile-avatar">
              {userInitials}
            </div>
            <h1 className="mws-user-profile-name">{user.username}</h1>
            <p className="mws-user-profile-email">{user.email}</p>
          </div>

          <div className="mws-user-profile-details">
            <div className="mws-user-profile-item">
              <span className="mws-user-profile-label">User ID:</span>
              <span className="mws-user-profile-value">{user.user_id}</span>
            </div>
            <div className="mws-user-profile-item">
              <span className="mws-user-profile-label">Created At:</span>
              <span className="mws-user-profile-value">{user.created_at?.split('T')[0]}</span>
            </div>
            <div className="mws-user-profile-item">
              <span className="mws-user-profile-label">Last Login:</span>
              <span className="mws-user-profile-value">{user.last_login?.split('T')[0]}</span>
            </div>

            <div className="mws-user-profile-roles">
              <h2>User Role</h2>
              <ul>
                <li>{userRole.role_name}</li>
              </ul>
            </div>
          </div>
        </div>

        {(userIsAdmin || isCurrentUserProfile) && (
          <div className="mws-user-profile-management">
            <h2>Manage Account</h2>
            <form className="mws-user-profile-form" action={handleUpdateProfile}>
              <input type="hidden" name="userId" value={user.user_id} />
              <div className="mws-form-group">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" defaultValue={user.username} required />
              </div>
              <div className="mws-form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" defaultValue={user.email} required />
              </div>
              {userIsAdmin && (
                <div className="mws-form-group">
                  <label htmlFor="role">Role:</label>
                  <select id="role" name="role" defaultValue={userRole.role_id} required>
                    {allRoles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button type="submit" className="mws-update-profile-btn">Update Profile</button>

              {updateError && <div className="mws-error-message">{updateError}</div>}
              {updateSuccess && <div className="mws-success-message">{updateSuccess}</div>}
            </form>

            {userIsAdmin && !isCurrentUserProfile && (
              <>
                <hr />
                <form className="mws-user-profile-form" action={handleDeleteAccount}>
                  <input type="hidden" name="userId" value={user.user_id} />
                  <button type="submit" className="mws-delete-account-btn">Delete User Account</button>
                  {deleteError && <div className="mws-error-message">{deleteError}</div>}
                </form>
              </>
            )}

            {isCurrentUserProfile && (
              <>
                <hr />
                <h2>Change Password</h2>
                <form className="mws-user-profile-form" action={handleChangePassword}>
                  <input type="hidden" name="userId" value={user.user_id} />
                  <div className="mws-form-group">
                    <label htmlFor="new-password">New Password:</label>
                    <input type="password" id="new-password" name="newPassword" required />
                  </div>
                  <div className="mws-form-group">
                    <label htmlFor="confirm-password">Confirm New Password:</label>
                    <input type="password" id="confirm-password" name="confirmPassword" required />
                  </div>
                  <button type="submit" className="mws-update-password-btn">Change Password</button>

                  {passwordError && <div className="mws-error-message">{passwordError}</div>}
                  {passwordSuccess && <div className="mws-success-message">{passwordSuccess}</div>}
                </form>
              </>
            )}
          </div>
        )}
      </div>

    </>
  );
};



