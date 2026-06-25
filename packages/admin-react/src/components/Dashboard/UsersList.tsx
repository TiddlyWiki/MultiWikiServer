import { useState } from 'react';
import { serverRequest, useAsyncEffect, useBind } from '../../helpers';
import { Button, Card, CardActions, CardContent, List, ListItemButton, ListItemText, Stack } from "@mui/material";
import { useCreateUserForm } from './useCreateUserForm';

export function Users() {

  const [refresh, setRefresh] = useState({});
  const handleRefresh = useBind(setRefresh, null, {});

  const [createMarkup, createSet] = useCreateUserForm(handleRefresh);

  const { result: users } = useAsyncEffect(async () => {
    return await serverRequest.user_list(undefined);
  }, undefined, undefined, [refresh]);

  return <CardContent>
    <Stack direction="column" spacing={2}>
      <Card variant='outlined'>
        <CardContent>
          <h1>Users</h1>
          <List>
            {users?.map((user) => (
              <ListItemButton href={`admin/users/${user.user_id}`}>
                <ListItemText
                  primary={<Stack direction="row" justifyContent="space-between"><span>{user.username}</span></Stack>}
                  secondary={<Stack direction="column" justifyContent="space-between">
                    <span>{user.email}</span>
                    <span>Last Login: {user.last_login?.slice(0, 10) || 'Never'}</span>
                    <span>Created: {user.created_at.slice(0, 10)}</span>
                  </Stack>}
                />
              </ListItemButton>
            ))}
          </List>
          {createMarkup}
        </CardContent>
        <CardActions>
          <Button onClick={() => { createSet(null); }}>Create new user</Button>
        </CardActions>
      </Card>
    </Stack>
  </CardContent >
}
