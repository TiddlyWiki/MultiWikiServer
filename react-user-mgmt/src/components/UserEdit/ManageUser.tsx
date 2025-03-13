import { Avatar, Card, CardContent, Chip, IconButton, List, ListItem, ListItemText, Stack } from '@mui/material';
import { JsonFormSimple } from '../../helpers/forms';
import {
  changePassword,
  DataLoader,
  FormFieldInput,
  serverRequest,
  useFormFieldHandler,
  useIndexJson
} from '../../helpers/utils';
import { } from '@mui/material/colors';
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import ArrowBack from '@mui/icons-material/ArrowBack';

const MyComponent = () => {
  const theme = useTheme();

  console.log(theme.palette.primary.main);    // Primary main color
  console.log(theme.palette.primary.light);   // Primary light color
  console.log(theme.palette.primary.dark);    // Primary dark color
  console.log(theme.palette.primary.contrastText); // Text color for contrast

  return <div style={{ color: theme.palette.primary.main }}>
    Primary color text
  </div>;
};


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
  const theme = useTheme();

  const [valueUpdate, onChangeUpdate] = useState<UpdateAccountFields>({
    userId: `${user.user_id}`,
    username: user.username,
    email: user.email,
    role: user.roles[0].role_id,
  });
  const [valueDelete, onChangeDelete] = useState<DeleteAccountFields>({
    user_id: `${user.user_id}`,
  });
  const [valuePassword, onChangePassword] = useState({
    userId: `${user.user_id}`,
    newPassword: "",
    confirmPassword: "",
  });

  console.log(valueUpdate, valueDelete, valuePassword);

  const userInitials = user.username?.[0].toUpperCase();
  interface UpdateAccountFields {
    userId: string;
    username: string;
    email: string;
    role: number;
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
        <Card className="mws-user-profile-container">
          <Stack sx={{ bgcolor: theme.palette.primary.main }} direction="row" justifyContent="start">
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={(event) => { location.pathname = "/admin/users"; }}
              sx={{ color: theme.palette.primary.contrastText }}
            >
              <ArrowBack />
            </IconButton>
          </Stack>
          <Stack spacing={0} sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }} alignItems="center" justifyContent="center" direction="column">

            <Avatar sx={{
              bgcolor: theme.palette.primary.contrastText,
              color: theme.palette.primary.main,
              width: "8rem",
              height: "8rem",
              fontSize: "3rem",
              fontWeight: "bold",
            }}>{userInitials}</Avatar>

            <h1>{user.username}</h1>
            <p>{user.email}</p>
          </Stack>
          <CardContent>
            <List >
              <ListItem><ListItemText primary="User ID" secondary={user.user_id} /></ListItem>
              <ListItem><ListItemText primary="Created At" secondary={user.created_at?.split('T')[0]} /></ListItem>
              <ListItem><ListItemText primary="Last Login" secondary={user.last_login?.split('T')[0]} /></ListItem>
            </List>

            <div className="mws-user-profile-roles">
              <h2>User Role</h2>
              <ul>
                {user.roles.map(e => (
                  <Chip key={e.role_id} label={e.role_name} />
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {(userIsAdmin || isCurrentUserProfile) && (
          <Card className="mws-user-profile-management">
            <h2>Manage Account</h2>
            <JsonFormSimple
              required={["userId", "username", "email"]}
              properties={{
                userId: { type: "string", title: "User ID", "ui:widget": "hidden", default: `${user.user_id}` },
                username: { type: "string", title: "Username" },
                email: { type: "string", title: "Email" },
                role: {
                  type: "number", title: "Role", "ui:widget": "select",
                  enum: allRoles.map(e => e.role_id),
                  enumNames: allRoles.map(e => e.role_name)
                },
              }}
              value={valueUpdate}
              onChange={onChangeUpdate}
              onSubmit={async (data, event) => {
                return await handleUpdateProfile(data.formData);
              }}
              submitOptions={{
                submitText: "Update Profile",
              }}
            />
            {isCurrentUserProfile && <JsonFormSimple
              required={["userId", "newPassword", "confirmPassword"]}
              properties={{
                userId: { type: "string", title: "User ID", "ui:widget": "hidden", default: `${user.user_id}` },
                newPassword: { type: "string", title: "New Password", "ui:widget": "password" },
                confirmPassword: { type: "string", title: "Confirm Password", "ui:widget": "password" },
              }}
              value={valuePassword}
              onChange={onChangePassword}
              onSubmit={async (data, event) => {
                return await handleChangePassword(data.formData);
              }}
              submitOptions={{
                submitText: "Change Password",
              }}
            />}
            {userIsAdmin && !isCurrentUserProfile && (
              <JsonFormSimple
                required={["user_id"]}
                properties={{
                  user_id: { type: "string", title: "User ID", "ui:widget": "hidden", default: `${user.user_id}` },
                }}
                value={valueDelete}
                onChange={onChangeDelete}
                onSubmit={async (data, event) => {
                  return await handleDeleteAccount(data.formData);
                }}
                submitOptions={{
                  submitText: "Delete Account",
                }}
              />
            )}

          </Card>
        )}
      </div>

    </>
  );
});

export default ManageUser;

