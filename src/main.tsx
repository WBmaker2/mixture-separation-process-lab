import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/shell.css';
import './styles/learning.css';
import './styles/process.css';
import './styles/simulation.css';
import './styles/report.css';
import './styles/print.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
