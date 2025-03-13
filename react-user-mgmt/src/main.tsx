import { StrictMode } from 'react';
import './styles/index.css';
import './styles/login.css';
import { createRoot } from 'react-dom/client';
import Login from './components/Login';
import { Frame } from './components/Frame/Frame';
import { DataLoader, getIndexJson, IndexJsonContext } from './helpers/utils';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
const theme = createTheme({
  palette:{
    background:{
      default:"#f0f0f0",
      paper: "#fff"
    }
  },
  
  colorSchemes: {
    dark: true,

  },
});
//https://v5.mui.com/material-ui/getting-started/

export const App = DataLoader(async () => {
  return await getIndexJson();
}, (indexJson, refresh, props) => {

  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <IndexJsonContext.Provider value={[indexJson, refresh]}>
          {location.pathname === "/login" ? <Login /> : <Frame />}
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

