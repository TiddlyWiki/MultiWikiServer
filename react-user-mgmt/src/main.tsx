import React, { StrictMode } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import './styles/index.css';
import './styles/login.css';
import { createRoot } from 'react-dom/client';
import ManageUser from './components/UserEdit/ManageUser';
import Login from './components/Login';
import UserManagement from './components/UserList/UserManagement';
import { Frame } from './components/Frame/Frame';
import { IndexJson, IndexJsonContext } from './helpers/server-types';



function App({ indexJson }: { indexJson: IndexJson }) {
  if (!indexJson) return null;
  return (
    <StrictMode>
      <IndexJsonContext.Provider value={indexJson}>
        {location.pathname === "/login" ? <Login /> : <Frame />}
      </IndexJsonContext.Provider>
    </StrictMode>
  );
}

(async () => {
  const preload = document.getElementById('index-json')?.textContent;
  const indexJson = preload ? JSON.parse(preload) : await (await fetch("/index.json")).json();
  createRoot(document.getElementById('root')!).render(<App indexJson={indexJson} />);
})();

