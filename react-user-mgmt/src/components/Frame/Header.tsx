import React, { useState } from 'react';
import { AppBar, Box, Button, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import { sessionRequest } from '../../helpers';


interface HeaderProps {
  pageTitle: string;
  username?: string;
  userIsAdmin: boolean | null;
  userIsLoggedIn: boolean;
  userId?: string;
}

const Header: React.FC<HeaderProps> = ({
  pageTitle,
  userIsLoggedIn,
  userIsAdmin,
  userId,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigateTo = (path: string) => {
    window.location.href = pathPrefix + path;
  };

  const handleManageUsers = () => {
    navigateTo('/admin/users');
  };

  const handleManageRoles = () => {
    navigateTo('/admin/roles');
  };

  const handleClickProfile = async () => {
    navigateTo(`/admin/users/${userId}`)
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await sessionRequest.logout(undefined);
    setIsLoggingOut(false);
    navigateTo('/');
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <Box sx={{ flexGrow: 0 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="home"
            sx={{ mr: 2 }}
            onClick={() => { navigateTo('/'); }}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {pageTitle}
          </Typography>
          {userIsLoggedIn ? (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={(event) => { setAnchorEl(event.currentTarget); }}
                color="inherit"
              >
                <SettingsIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={() => { setAnchorEl(null); }}
              >
                <MenuItem divider onClick={handleClickProfile}>Profile</MenuItem>
                {userIsAdmin && <MenuItem onClick={handleManageUsers}>Manage Users</MenuItem>}
                {userIsAdmin && <MenuItem divider onClick={handleManageRoles}>Manage Roles</MenuItem>}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          ) : <Button color="inherit" onClick={() => {
            navigateTo('/login');
          }}>Login</Button>}
        </Toolbar>
      </AppBar>
    </Box>
  )

};

export default Header;
