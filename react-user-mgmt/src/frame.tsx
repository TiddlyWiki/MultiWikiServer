import { createContext, ReactNode, useContext, useState } from 'react';
import { Divider, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

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
    <Stack direction="column" height="100vh" width="100vw">
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
        <List component="nav" aria-label="main mailbox folders" sx={showText ? { width: "200px" } : {}}>
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

export function FrameMenuLine({ icon, text1, text2, selected }: {
  icon: ReactNode;
  text1: string;
  text2?: string;
  selected?: boolean;
}) {
  const showText = useContext(ShowTextContext);
  console.log(<Divider />)
  return (
    <ListItemButton sx={{ borderRadius: 10, padding: 2, height: "56px" }} selected={selected}>
      <ListItemIcon sx={!showText ? { minWidth: "24px" } : {}} >{icon}</ListItemIcon>
      {showText && <ListItemText primary={text1} secondary={text2} />}
    </ListItemButton>
  )
}