import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Clear the boot spinner from index.html once the app has painted.
requestAnimationFrame(() => {
  document.getElementById('boot')?.remove();
});
