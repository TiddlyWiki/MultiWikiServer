import React, { ReactNode, useCallback, useState } from 'react';
import Header from '../Frame/Header';
import { useAsyncEffect } from '../../helpers/useAsyncEffect';
import { changePassword, DataLoader, fetchPostSearchParams, FormFieldInput, serverRequest, useFormFieldHandler, useIndexJson } from '../../helpers/utils';


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


const ManageUser = DataLoader(async (props: { userID: string }) => {
  const res = await serverRequest.prisma.users.findUnique({
    where: { user_id: +props.userID },
    select: {
      user_id: true,
      username: true,
      email: true,
      roles: true,
      last_login: true,
      created_at: true,
    }
  });
  if (!res) throw "User not found";
  const allRoles = await serverRequest.prisma.roles.findMany({
    select: {
      role_id: true,
      role_name: true,
    }
  });
  return [res, allRoles] as const;

}, ([user, allRoles], refreshUser, props) => {

  const [indexJson] = useIndexJson();
  const isCurrentUserProfile = indexJson.user_id === user.user_id;
  const userIsAdmin = indexJson.isAdmin;

  const update = useFormFieldHandler<UpdateAccountFields>(refreshUser);
  const password = useFormFieldHandler<ChangePasswordFields>(refreshUser);
  const deleteForm = useFormFieldHandler<DeleteAccountFields>(refreshUser);

  const userInitials = user.username?.[0].toUpperCase();
  interface UpdateAccountFields {
    userId: string;
    username: string;
    email: string;
    role: string;
  }
  const handleUpdateProfile = async (formData: UpdateAccountFields) => {
    return await serverRequest.user_update({
      user_id: +formData.userId,
      username: formData.username,
      email: formData.email,
      role_id: +formData.role,
    }).then(() => {
      return "User updated successfully.";
    }).catch(e => {
      throw `${e}`;
    });
  }

  interface DeleteAccountFields {
    user_id: string;
  }
  const handleDeleteAccount = async (formData: DeleteAccountFields) => {
    if (window.confirm('Are you sure you want to delete this user account? This action cannot be undone.'))
      return await serverRequest.user_delete({ user_id: +formData.user_id }).then(() => {
        return "User deleted successfully.";
      }).catch(e => {
        throw `${e}`;
      });
    else
      throw "Cancelled.";
  };
  interface ChangePasswordFields {
    userId: string;
    newPassword: string;
    confirmPassword: string;
  }
  const handleChangePassword = async (formData: ChangePasswordFields) => {
    const { userId, newPassword: password, confirmPassword } = formData;

    if (!userId || !password || !confirmPassword) throw "All fields are required.";

    if (password !== confirmPassword) {
      throw "Passwords do not match.";
    }

    return await changePassword({ userId, password, confirmPassword }).then(() => {
      return "Password successfully changed.";
    }).catch(e => {
      throw `${e}`;
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
                {user.roles.map(e => (
                  <li key={e.role_id}>{e.role_name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {(userIsAdmin || isCurrentUserProfile) && (
          <div className="mws-user-profile-management">
            <h2>Manage Account</h2>
            <form className="mws-user-profile-form" onSubmit={update.handler(handleUpdateProfile)}>
              <FormFieldInput {...update.register("userId", { required: true, value: `${user.user_id}` })}
                type="hidden" id title="" />
              <FormFieldInput {...update.register("username", { required: true })}
                type="text" id title="Username:" />
              <FormFieldInput {...update.register("email", { required: true })}
                type="email" id title="Email:" />
              {userIsAdmin && (
                <FormFieldInput {...update.register("role", { required: true })}
                  type="select" id title="Role:">
                  {allRoles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
                </FormFieldInput>
              )}
              {update.footer("Update Profile")}
            </form>

            {userIsAdmin && !isCurrentUserProfile && (
              <>
                <hr />
                <form className="mws-user-profile-form" onSubmit={deleteForm.handler(handleDeleteAccount)}>
                  <FormFieldInput {...deleteForm.register("user_id", { required: true, value: `${user.user_id}` })}
                    type="hidden" id title="" />
                  {deleteForm.footer("Delete Account")}
                </form>
              </>
            )}

            {isCurrentUserProfile && (

              <form className="mws-user-profile-form" onSubmit={password.handler(handleChangePassword)}>
                <FormFieldInput {...password.register("userId", { required: true, value: `${user.user_id}` })}
                  type="hidden" id title="" />
                <FormFieldInput
                  {...password.register("newPassword", { required: true })}
                  type="password"
                  id
                  title="New Password:"
                  autoComplete='new-password'
                />
                <FormFieldInput
                  {...password.register("confirmPassword", { required: true })}
                  type="password"
                  id
                  title="Confirm Password:"
                  autoComplete='new-password'
                />
                {password.footer("Change Password")}
              </form>

            )}
          </div>
        )}
      </div>

    </>
  );
});

export default ManageUser;

