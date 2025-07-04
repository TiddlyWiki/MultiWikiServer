
import { PropsWithChildren, ReactNode, useState } from 'react';
import Header from './Header';

import { Recipes, Bags } from '../Dashboard/Dashboard';
import UserManagement from '../UserList/UserManagement';
import ManageUser from '../UserEdit/ManageUser';
import { useIndexJson } from '../../helpers/utils';
import { UsersScreen } from '../Users';
import { ErrorBoundary } from 'react-error-boundary';
import { Button, Container, Stack } from '@mui/material';

import { createContext, useContext } from 'react';
import { Divider, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import { Avatar, Card, CardContent, CardHeader, Menu, MenuItem, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Logout from '@mui/icons-material/Logout';
import BackpackIcon from '@mui/icons-material/Backpack';
import LuggageRoundedIcon from '@mui/icons-material/LuggageRounded';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import ExtensionIcon from '@mui/icons-material/Extension';
import { sessionRequest } from '../../helpers';
import { ClientPlugins } from '../Dashboard/ClientPlugins';
import Settings from './Settings';


function Message({ children }: PropsWithChildren<{}>) {
  return <Stack alignItems="center" direction="column" padding={8} >{children}</Stack>

}

export interface FrameProps {
  children?: ReactNode | undefined;
  title: string;
  iconUrl: string;
  /** @see FrameMenuLine */
  menu: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function Frame({ title, iconUrl, menu, children, center, right }: FrameProps) {
  const [showText, setShowText] = useState(true);

  return <ShowTextContext.Provider value={showText}>
    <Stack direction="column" minHeight="100vh">
      <Stack direction="row" justifyContent="space-between" spacing={10}>
        <Stack direction="row" alignItems="center">
          <IconButton
            sx={{ padding: 2 }}
            size="large"
            onClick={() => { setShowText(!showText); }}
          ><MenuIcon /></IconButton>
          <Stack padding={1}><img src={iconUrl} height={40} /></Stack>
          <Typography fontSize={24}>{title}</Typography>
        </Stack>
        <Stack direction="row">
          {center}
        </Stack>
        <Stack direction="row">
          {right}
        </Stack>
      </Stack>
      <Stack direction="row" alignItems={"stretch"} justifyContent="stretch">
        <List component="nav" aria-label="main mailbox folders" sx={showText ? { width: "300px" } : {}}>
          {menu}
        </List>
        <Stack
          direction="column" justifyContent={"stretch"} alignItems={"stretch"}
          flexGrow={1} margin={1}>
          {children}
        </Stack>
      </Stack>
    </Stack>
  </ShowTextContext.Provider>
}

const ShowTextContext = createContext(false);

export function FrameMenuLine({ icon, text1, text2, selected, onClick, }: {
  icon: ReactNode;
  text1: string;
  text2?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  const showText = useContext(ShowTextContext);
  return (
    <ListItemButton onClick={onClick} sx={{ borderRadius: 10, padding: 2, height: "56px" }} selected={selected}>
      <ListItemIcon sx={!showText ? { minWidth: "24px" } : {}} >{icon}</ListItemIcon>
      {showText && <ListItemText primary={text1} secondary={text2} />}
    </ListItemButton>
  )
}

export function PageRoot() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => { setAnchorEl(event.currentTarget); };
  const handleClose = () => { setAnchorEl(null); };

  const [indexJson, refresh] = useIndexJson();

  const username = indexJson?.username;
  const userIsAdmin = indexJson?.isAdmin || false;
  const userIsLoggedIn = !!indexJson.isLoggedIn;
  const userId = indexJson.user_id;


  const pages: [RegExp, (args: string[]) => ReactNode, string][] = [
    [/^\/$/, () => <Recipes />, "Recipes"],
    [/^\/admin\/recipes$/, () => <Recipes />, "Recipes"],
    [/^\/admin\/bags$/, () => <Bags />, "Bags"],
    [/^\/admin\/client-plugins$/, () => <ClientPlugins />, "Plugins"],
    [/^\/admin\/users\/?$/, () => <UserManagement />, "User Management"],
    [/^\/admin\/users\/(.*)$/, ([, user_id]) => <ManageUser userID={user_id!} />, "Manage User"],
    [/^\/admin\/roles$/, () => <UsersScreen />, "Roles"],
    [/^\/admin\/settings$/, () => <Settings/>, "Settings"],
  ];
  const route = location.pathname.slice(pathPrefix.length);
  const matches = pages.map(([re]) => re.exec(route));
  const index = matches.findIndex(m => m !== null);
  const page = index > -1 && pages[index]![1](matches[index]!) || null;
  const navigateTo = (path: string) => {
    window.location.href = pathPrefix + path;
  };

  const handleRecipes = () => {
    navigateTo("/admin/recipes");
  }
  const handleBags = () => {
    navigateTo("/admin/bags");
  }
  const handlePlugins = () => {
    navigateTo("/admin/client-plugins");
  }


  const handleManageUsers = () => {
    navigateTo('/admin/users');
  };

  const handleManageRoles = () => {
    navigateTo('/admin/roles');
  };

  const handleClickProfile = async () => {
    navigateTo(`/admin/users/${userId}`)
  };
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await sessionRequest.logout(undefined);
    setIsLoggingOut(false);
    navigateTo('/');
  };

  return (
    <Frame
      title="MWS"
      iconUrl='favicon.png'
      menu={<>
        <FrameMenuLine onClick={handleRecipes} icon={<AssignmentIcon />} text1="Recipes" />
        <FrameMenuLine onClick={handleBags} icon={<LuggageRoundedIcon />} text1="Bags" />
        <FrameMenuLine onClick={handlePlugins} icon={<ExtensionIcon />} text1="TW5 Plugins" />
        {userIsAdmin ? <>
          <Divider />
          <FrameMenuLine onClick={handleManageUsers} icon={<PersonIcon />} text1="Users" />
          <FrameMenuLine onClick={handleManageRoles} icon={<GroupsIcon />} text1="Roles" />
          <Divider />
          <FrameMenuLine onClick={() => navigateTo('/admin/settings')} icon={<SettingsIcon />} text1="Settings" />
        </> : null}
        
      </>}
      right={userIsLoggedIn ? <>
        {/* <IconButton onClick={() => { }} sx={{ padding: 2 }} size="large"><SettingsIcon /></IconButton> */}
        <Tooltip title="User menu">
          <Button
            onClick={handleClick}
            size="small"
            sx={{ ml: 2, textTransform: 'none', fontSize: '0.9em', color: 'white'}}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            endIcon={<Avatar />}
          >
	  {indexJson.username}
          </Button>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClickProfile}>
	  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          Profile
	  </MenuItem>
          {/* <MenuItem onClick={handleClose}>
            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>Settings
          </MenuItem> */}
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>Logout
          </MenuItem>
          <Divider/>
          <MenuItem disabled>
            TW5: {indexJson.versions.tw5}
          </MenuItem>
          <MenuItem disabled>
            MWS: {indexJson.versions.mws}
          </MenuItem>
        </Menu>
      </> : <Button color="inherit" onClick={() => {
        navigateTo('/login');
      }}>Login</Button>}
    >
      <ErrorBoundary fallback={<Message>An error occured</Message>} >
        {page ?? <Message>Page not found</Message>}
        {/* <Card variant='outlined' sx={{ borderRadius: 7 }}></Card> */}
      </ErrorBoundary>
    </Frame >
  );
}
