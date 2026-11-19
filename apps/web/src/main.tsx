import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SimProvider } from './sim/SimProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SimProvider>
        <App />
      </SimProvider>
    </BrowserRouter>
  </StrictMode>,
);
