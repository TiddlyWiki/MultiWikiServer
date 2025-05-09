import { Avatar, Button, Card, CardActions, CardContent, IconButton, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Stack } from "@mui/material";
import { IndexJson, useEventEmitter, useIndexJson } from "../../helpers";

import EditIcon from '@mui/icons-material/Edit';
import { useRoleEditForm } from "./RoleEdit";
import { useState } from "react";

export const UsersScreen = () => {
  const [indexJson] = useIndexJson();

  const [roleEditMarkup, setRoleEdit] = useRoleEditForm();

  return <>
    <CardContent>
      {roleEditMarkup}
      <Stack direction="column" spacing={2}>
        {/* <Card variant='outlined'>
          <CardContent>
            <h3>Users</h3>
            <List>
              {indexJson.userList?.map(user => (
                <ListItem key={user.user_id}>
                  <ListItemAvatar><Avatar>{user.username[0]}</Avatar></ListItemAvatar>
                  <ListItemText primary={user.username} secondary={user.email} />
                  <ListItemText primary={user.roles.map(role => role.role_name).join(", ")} />
                  <Stack>
                    <IconButton edge="end" onClick={() => userEditEvents.emit({ type: 'open', value: user })}>
                      <EditIcon />
                    </IconButton>
                  </Stack>
                </ListItem>
              )) ?? []}
            </List>
          </CardContent>
          <CardActions>
            <Button onClick={() => {
              userEditEvents.emit({ type: "open", value: null });
            }}>Create new user</Button>
          </CardActions>
        </Card> */}
        <Card variant='outlined'>
          <CardContent>
            <h3>Roles</h3>
            <List>
              {indexJson.roleList.map(role => (
                <ListItem key={role.role_id}>
                  <ListItemAvatar><Avatar>{role.role_name[0]}</Avatar></ListItemAvatar>
                  <ListItemText primary={role.role_name} secondary={role.description} />
                  <Stack>
                    <IconButton edge="end" onClick={() => setRoleEdit(role)}>
                      <EditIcon />
                    </IconButton>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </CardContent>
          <CardActions>
            <Button onClick={() => {
              setRoleEdit(null);
            }}>Create new role</Button>
          </CardActions>
        </Card>
      </Stack>
    </CardContent>
  </>
}