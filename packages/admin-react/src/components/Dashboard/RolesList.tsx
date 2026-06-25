import { Avatar, Button, Card, CardActions, CardContent, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Stack } from "@mui/material";
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
        <Card variant='outlined'>
          <CardContent>
            <h3>Roles</h3>
            <List>
              {indexJson.roleList.map(role => (
                <ListItemButton key={role.role_id} onClick={() => setRoleEdit(role)}>
                  <ListItemAvatar><Avatar>{role.role_name[0]}</Avatar></ListItemAvatar>
                  <ListItemText primary={role.role_name} secondary={role.description} />
                </ListItemButton>
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