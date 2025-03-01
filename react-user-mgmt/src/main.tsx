import { StrictMode } from 'react';
import './styles/index.css';
import './styles/login.css';
import { createRoot } from 'react-dom/client';
import Login from './components/Login';
import { Frame } from './components/Frame/Frame';
import { DataLoader } from './helpers/utils';
import { IndexJsonContext } from './helpers/server-types';


export const App = DataLoader(async () => {
  const res = await fetch("/api/IndexJson");
  return await res.json();
}, (indexJson: ServerMapResponse["IndexJson"], refresh, props) => {
  return (
    <StrictMode>
      <IndexJsonContext.Provider value={indexJson}>
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

