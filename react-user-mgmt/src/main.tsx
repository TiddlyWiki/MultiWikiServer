import { ReactNode, StrictMode, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DataLoader, getIndexJson, IndexJsonContext } from './helpers/utils';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Avatar, Card, CardContent, CardHeader, CssBaseline, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { ErrorBoundary } from "react-error-boundary";
import MenuIcon from '@mui/icons-material/Menu';
const theme = createTheme({
  palette: {
    background: {
      default: "#f0f0f0",
      paper: "#fff"
    }
  },

  colorSchemes: {
    dark: true,

  },
});

function Login() {
  return null;
}
function Frame() {
  const onClickProfile = () => { };
  const [showText, setShowText] = useState(false);

  return <Stack direction="column" height="100vh" width="100vw">
    <Stack direction="row" justifyContent="space-between" spacing={10}>
      <Stack direction="row" alignItems="center">
        <IconButton
          sx={{ padding: 2 }}
          size="large"
          onClick={() => { setShowText(!showText); }}
        ><MenuIcon /></IconButton>
        <Stack padding={1}><img src="favicon.png" height={40} /></Stack>
        <Typography fontSize={24}>MWS</Typography>
      </Stack>
      <Stack direction="row">
        <IconButton onClick={onClickProfile}><Avatar></Avatar></IconButton>
      </Stack>
    </Stack>
    <Stack direction="row" alignItems={"stretch"} justifyContent="stretch">
      <List component="nav" aria-label="main mailbox folders" sx={showText ? { width: "200px" } : {}}>
        <LeftMenuLine showText={showText} icon={<MenuIcon />} text1="Inbox" />
        <LeftMenuLine showText={showText} icon={<MenuIcon />} text1="Inbox" />
        <LeftMenuLine showText={showText} icon={<MenuIcon />} text1="Inbox" />
        <LeftMenuLine showText={showText} icon={<MenuIcon />} text1="Inbox" />
        <LeftMenuLine showText={showText} icon={<MenuIcon />} text1="Inbox" />
        <LeftMenuLine showText={showText} icon={<MenuIcon />} text1="Inbox" />
        <LeftMenuLine showText={showText} icon={<MenuIcon />} text1="Inbox" />
        <LeftMenuLine showText={showText} icon={<MenuIcon />} text1="Inbox" />
        <LeftMenuLine showText={showText} icon={<MenuIcon />} text1="Inbox" />
        <LeftMenuLine showText={showText} icon={<MenuIcon />} text1="Inbox" />
      </List>
      <Stack direction="column" justifyContent={"stretch"} alignItems={"stretch"}
        flexGrow={1} margin={1}>
        <Card variant='outlined' sx={{ borderRadius: 7 }}>
          <CardHeader title="Test"/>
          <CardContent>test</CardContent>
        </Card>
      </Stack>
    </Stack>
  </Stack >
}

function LeftMenuLine({ showText, icon, text1, text2 }: {
  showText?: boolean;
  icon: ReactNode;
  text1: string;
  text2?: string;
}) {

  return (
    <ListItemButton sx={{ borderRadius: 10, padding: 2, height: "56px" }}>
      <ListItemIcon sx={!showText ? { minWidth: "24px" } : {}} >{icon}</ListItemIcon>
      {showText && <ListItemText primary={text1} secondary={text2} />}
    </ListItemButton>
  )
}

export const App = DataLoader(async () => {
  return await getIndexJson();
}, (indexJson, refresh, props) => {
  useEffect(() => { window.document.documentElement.classList.add("loaded"); }, []);
  const route = location.pathname.slice(pathPrefix.length);
  return (
    <StrictMode>
      <ThemeProvider theme={theme} defaultMode="system" noSsr>
        <CssBaseline enableColorScheme />
        <IndexJsonContext.Provider value={[indexJson, refresh]}>
          <ErrorBoundary fallback={null} >
            {route === "/login" ? <Login /> : <Frame />}
          </ErrorBoundary>
        </IndexJsonContext.Provider>
      </ThemeProvider>
    </StrictMode>
    // <StrictMode>
    //   <ThemeProvider theme={theme}>
    //     <CssBaseline />
    //     {location.pathname === "/login" ? <Login /> : <Frame />}
    //   </ThemeProvider>
    // </StrictMode>
  );
});

(async () => {
  // const preload = document.getElementById('index-json')?.textContent;
  // const indexJson = preload ? JSON.parse(preload) : await (await fetch("/index.json")).json();
  createRoot(document.getElementById('root')!).render(<App />);
})();

