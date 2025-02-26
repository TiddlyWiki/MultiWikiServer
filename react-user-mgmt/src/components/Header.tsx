import React, { useState } from 'react';

interface HeaderProps {
  pageTitle: string;
  username?: string;
  userIsAdmin: boolean;
  userIsLoggedIn: boolean;
  firstGuestUser: boolean;
  userId?: string;
}

const Header: React.FC<HeaderProps> = ({
  pageTitle,
  username,
  userIsAdmin,
  userIsLoggedIn,
  firstGuestUser,
  userId
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
    try {
      await fetch('/admin/anon', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Error configuring anonymous access:', error);
    }
  };
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('/logout', { method: 'POST' });
      
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
    }
  };

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
