import { Avatar, Card, CardContent, CardHeader, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import { ErrorBoundary } from "react-error-boundary";
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import { Frame, FrameMenuLine } from '../frame';
import { useState } from 'react';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import BackpackIcon from '@mui/icons-material/Backpack';
import LuggageRoundedIcon from '@mui/icons-material/LuggageRounded';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';

export function PageRoot() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Frame
      title="MWS"
      iconUrl='favicon.png'
      menu={<>
        <FrameMenuLine icon={<AssignmentIcon />} text1="Recipes" />
        <FrameMenuLine icon={<LuggageRoundedIcon />} text1="Bags" />
        <Divider/>
        <FrameMenuLine icon={<PersonIcon />} text1="Users" />
        <FrameMenuLine icon={<GroupsIcon />} text1="Roles" />
      </>}
      right={<>
        <IconButton onClick={() => { }} sx={{ padding: 2 }} size="large"><SettingsIcon /></IconButton>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar></Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          // slotProps={{
          //   paper: {
          //     elevation: 0,
          //     sx: {
          //       overflow: 'visible',
          //       filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          //       mt: 1.5,
          //       '& .MuiAvatar-root': {
          //         width: 32,
          //         height: 32,
          //         ml: -0.5,
          //         mr: 1,
          //       },
          //       // '&::before': {
          //       //   content: '""',
          //       //   display: 'block',
          //       //   position: 'absolute',
          //       //   top: 0,
          //       //   right: 5,
          //       //   width: 10,
          //       //   height: 10,
          //       //   bgcolor: 'background.paper',
          //       //   transform: 'translateY(-50%) rotate(45deg)',
          //       //   zIndex: 0,
          //       // },
          //     },
          //   },
          // }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose}>
            <ListItemIcon><Avatar /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon sx={{ marginRight: 1 }}><Avatar /></ListItemIcon>
            Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <PersonAdd fontSize="small" />
            </ListItemIcon>
            Add another account
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </>}
    >
      <ErrorBoundary fallback={null} >
        <Card variant='outlined' sx={{ borderRadius: 7 }}>
          <CardHeader title="Test" />
          <CardContent>test</CardContent>
        </Card>
      </ErrorBoundary>
    </Frame>
  );
}