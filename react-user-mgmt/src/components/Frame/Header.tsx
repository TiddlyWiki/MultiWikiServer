import React, { useState } from 'react';
import { AppBar, Box, Button, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import { serverRequest } from '../../helpers/utils';
import { logout } from '../Login';

interface HeaderProps {
  pageTitle: string;
  username?: string;
  userIsAdmin: boolean | null;
  userIsLoggedIn: boolean;
  firstGuestUser: boolean;
  userId?: number;
  setShowAnonConfig: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  pageTitle,
  username,
  userIsAdmin,
  userIsLoggedIn,
  firstGuestUser,
  userId,
  setShowAnonConfig
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  const handleManageUsers = () => {
    navigateTo('/admin/users?q=*');
  };

  const handleManageRoles = () => {
    navigateTo('/admin/roles?q=*');
  };

  const handleAnonConfig = async () => {
    setShowAnonConfig(true);
  };

  const handleClickProfile = async () => {
    navigateTo(`/admin/users/${userId}`)
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    window.location.href = '/';
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
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
                <MenuItem onClick={handleManageUsers}>Manage Users</MenuItem>
                <MenuItem divider onClick={handleManageRoles}>Manage Roles</MenuItem>
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

  return (
    <div className="mws-header">
      <h1>
        <a href="/">
          <span className="mws-logo">🏠</span>
        </a>
        <span className="divider">|</span>
        <span>{pageTitle}</span>
      </h1>
      <div className="mws-user-info">
        <span>Hello, {username}</span>
        {userIsAdmin && (
          <div className="mws-admin-dropdown">
            <button className="mws-admin-dropbtn">⚙️</button>
            <div className="mws-admin-dropdown-content">
              <button onClick={handleManageUsers} className="mws-admin-form-button">
                Manage Users
              </button>
              <button onClick={handleManageRoles} className="mws-admin-form-button">
                Manage Roles
              </button>
              <button onClick={handleAnonConfig} className="mws-admin-form-button">
                Reconfigure Anonymous Access
              </button>
            </div>
          </div>
        )}
        {userIsLoggedIn && !firstGuestUser && !userIsAdmin && userId && (
          <button
            onClick={() => navigateTo(`/admin/users/${userId}`)}
            className="mws-profile-btn"
          >
            Profile
          </button>
        )}
        {userIsLoggedIn ? (
          <button
            onClick={handleLogout}
            className="mws-logout-button"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        ) : (
          <button
            onClick={() => navigateTo('/login')}
            className="mws-login-btn"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
