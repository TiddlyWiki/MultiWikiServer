
import { StrictMode } from 'react';
import Dashboard from './components/Dashboard';
import './styles/index.css';
import { createRoot } from 'react-dom/client';

// This would typically come from an API or server-side props
const dummyProps = {
  initialRecipes: [],
  initialBags: [],
  username: 'Guest',
  userIsAdmin: false,
  userIsLoggedIn: false,
  firstGuestUser: true,
  initialShowSystem: false,
  initialShowAnonConfig: false,
  initialAllowReads: true,
  initialAllowWrites: false
};


// Uncomment this section if you're directly rendering to the DOM
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Dashboard {...dummyProps} />
  </StrictMode>,
)

