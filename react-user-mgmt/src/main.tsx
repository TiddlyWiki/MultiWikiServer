import { StrictMode } from 'react';
import Dashboard from './components/Dashboard';
import './styles/index.css';
import './styles/login.css';
import { createRoot } from 'react-dom/client';
import ManageUser from './components/ManageUser';
import Login from './components/Login';

function App() {

  // Handle different routes
  const path = location.pathname;

  return (
    <StrictMode>
      {path === "/" && <Dashboard />}
      {path === "/login" && <Login />}
      {path.startsWith("/admin/users/") && <ManageUser />}
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
