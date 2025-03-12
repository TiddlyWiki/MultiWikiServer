import { Card, CardContent, Chip, List, ListItem, ListItemText } from '@mui/material';
import { JsonForm } from '../../helpers/forms';
import {
  changePassword,
  DataLoader,
  FormFieldInput,
  serverRequest,
  useFormFieldHandler,
  useIndexJson
} from '../../helpers/utils';


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
        <Card className="mws-user-profile-container">
          <div className="mws-user-profile-header">
            <div className="mws-user-profile-avatar">
              {userInitials}
            </div>
            <h1 className="mws-user-profile-name">{user.username}</h1>
            <p className="mws-user-profile-email">{user.email}</p>
          </div>
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
            <JsonForm
              required={["userId", "username", "email"]}
              properties={{
                userId: { type: "string", title: "User ID", "ui:widget": "hidden", default: `${user.user_id}` },
                username: { type: "string", title: "Username" },
                email: { type: "string", title: "Email" },
                role: {
                  type: "string", title: "Role", "ui:widget": "select",
                  enum: allRoles.map(e => e.role_id),
                  enumNames: allRoles.map(e => e.role_name)
                },
              }}
              onSubmit={async (data, event) => {
                return await handleUpdateProfile(data.formData);
              }}
              submitOptions={{
                submitText: "Update Profile",
              }}
            />
            {isCurrentUserProfile && <JsonForm
              required={["userId", "newPassword", "confirmPassword"]}
              properties={{
                userId: { type: "string", title: "User ID", "ui:widget": "hidden", default: `${user.user_id}` },
                newPassword: { type: "string", title: "New Password", "ui:widget": "password" },
                confirmPassword: { type: "string", title: "Confirm Password", "ui:widget": "password" },
              }}
              onSubmit={async (data, event) => {
                return await handleChangePassword(data.formData);
              }}
              submitOptions={{
                submitText: "Change Password",
              }}
            />}
            {userIsAdmin && !isCurrentUserProfile && (
              <JsonForm
                required={["user_id"]}
                properties={{
                  user_id: { type: "string", title: "User ID", "ui:widget": "hidden", default: `${user.user_id}` },
                }}
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

