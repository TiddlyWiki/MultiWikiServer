import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { DataLoader, getIndexJson, IndexJsonContext } from './helpers/utils';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ErrorBoundary } from "react-error-boundary";
import { PageRoot } from './pages';
const theme = createTheme({
  // palette: {
  //   background: {
  //     default: "#f0f0f0",
  //     paper: "#fff"
  //   }
  // },
  colorSchemes: {
    dark: true,
  },
});

function Login() {
  return null;
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
            {route === "/login" ? <Login /> : <PageRoot />}
          </ErrorBoundary>
        </IndexJsonContext.Provider>
      </ThemeProvider>
    </StrictMode>
  );
});


(async () => {
  // const preload = document.getElementById('index-json')?.textContent;
  // const indexJson = preload ? JSON.parse(preload) : await (await fetch("/index.json")).json();
  createRoot(document.getElementById('root')!).render(<App />);
})();

