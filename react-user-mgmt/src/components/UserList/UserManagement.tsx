import React, { useState, useEffect, useCallback } from 'react';
import Header from '../Frame/Header';
import { useAsyncEffect } from '../../helpers/useAsyncEffect';
import AddUserForm from './AddUserForm';
import { DataLoader, serverRequest, useIndexJson } from '../../helpers/utils';
import { Box, Card, CardContent, Container, Grid, Stack } from '@mui/material';


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

export const UserManagement = DataLoader(async () => {
  return await serverRequest.user_list(undefined);
}, (userList, refreshUsers, props) => {
  const [indexJson, refreshIndex] = useIndexJson();
  const userIsAdmin = indexJson?.isAdmin || false;
  const firstGuestUser = indexJson?.firstGuestUser || false;
  const username = indexJson?.username || "";

  const refreshPage = useCallback(() => {
    refreshUsers();
    refreshIndex();
  }, [refreshUsers, refreshIndex]);

  return (
    <Container maxWidth="lg">
      <Stack direction="row" width="100%" spacing={2} marginBlockStart={4}>
        <Card sx={{ flexGrow: 1 }}><CardContent>{userList.map((user) => (

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
                Created: {user.created_at.slice(0, 10)}
              </span>
              <span className="mws-user-last-login">
                Last Login: {user.last_login?.slice(0, 10) || 'Never'}
              </span>
            </div>
          </a>

        ))}</CardContent></Card>
        <AddUserForm refreshPage={refreshPage} />
      </Stack>
    </Container>
  )

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
            <AddUserForm refreshPage={refreshPage} />
          </div>
        )}
      </div>
    </>
  );
});

export default UserManagement;