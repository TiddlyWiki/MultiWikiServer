import { Avatar, Card, CardContent, Chip, IconButton, List, ListItem, ListItemText, Stack } from '@mui/material';
import { ButtonAwait, DataLoader, serverRequest, useIndexJson } from '../../helpers';
import { } from '@mui/material/colors';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useProfileForm } from './useProfileForm';
import { usePasswordForm } from './usePasswordForm';

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

const handleDeleteAccount = async (user_id: string) => {
  if (window.confirm('Are you sure you want to delete this user account? This action cannot be undone.'))
    return await serverRequest.user_delete({ user_id }).then(() => {
      return "User deleted successfully.";
    }).catch(e => {
      throw `${e}`;
    });
  else
    throw "Cancelled.";
};


const ManageUser = DataLoader(async (props: { userID: string }) => {
  return await serverRequest.user_edit_data({ user_id: props.userID });
}, ({ user, allRoles }, refreshUser, props) => {

  const [profileFormMarkup] = useProfileForm(allRoles, user, refreshUser);
  const [passwordFormMarkup] = usePasswordForm(user);

  const [indexJson] = useIndexJson();
  const isCurrentUserProfile = indexJson.user_id === user.user_id;
  const userIsAdmin = indexJson.isAdmin;
  const theme = useTheme();

  const userInitials = user.username?.[0].toUpperCase();

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
              href={userIsAdmin ? "admin/users" : " "} // space is important
              // onClick={(event) => { location.pathname = "admin/users"; }}
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
            {userIsAdmin && !isCurrentUserProfile && (
              <ButtonAwait
                onClick={async () => {
                  await handleDeleteAccount(user.user_id);
                }}
                variant="outlined"
                color="error"
                sx={{ marginBlock: 2 }}
              >
                Delete Account
              </ButtonAwait>
            )}
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
            <h2>Manage User</h2>
            {userIsAdmin && profileFormMarkup}
            <h2>Change Password</h2>
            {passwordFormMarkup}
          </Card>
        )}
      </div>

    </>
  );
});

export default ManageUser;

