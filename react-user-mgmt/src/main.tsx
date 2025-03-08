import { StrictMode } from 'react';
import './styles/index.css';
import './styles/login.css';
import { createRoot } from 'react-dom/client';
import Login from './components/Login';
import { Frame } from './components/Frame/Frame';
import { DataLoader, getIndexJson, IndexJsonContext } from './helpers/utils';



export const App = DataLoader(async () => {
  return await getIndexJson();
}, (indexJson, refresh, props) => {
  return (
    <StrictMode>
      <IndexJsonContext.Provider value={[indexJson, refresh]}>
        {location.pathname === "/login" ? <Login /> : <Frame />}
      </IndexJsonContext.Provider>
    </StrictMode>
  );
});

(async () => {
  // const preload = document.getElementById('index-json')?.textContent;
  // const indexJson = preload ? JSON.parse(preload) : await (await fetch("/index.json")).json();
  createRoot(document.getElementById('root')!).render(<App />);
})();

