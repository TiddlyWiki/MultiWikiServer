
import { StrictMode } from 'react';
import Dashboard from './components/Dashboard';
import './styles/index.css';
import { createRoot } from 'react-dom/client';
import { useAsyncEffect } from './helpers/useAsyncEffect';


// const dummyProps = {
//   username: 'Guest',
//   userIsAdmin: true,
//   userIsLoggedIn: true,
//   firstGuestUser: false,
//   initialShowSystem: false,
//   initialShowAnonConfig: false,
//   initialAllowReads: true,
//   initialAllowWrites: false
// };

function App() {
  const { loading, result } = useAsyncEffect(async () => {
    return await (await fetch("/index.json")).json();
  }, undefined, undefined, []);

  if (loading) return null;

  return (
    <StrictMode>
      <Dashboard {...result} />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
