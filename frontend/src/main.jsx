import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './hooks/ThemeContext.jsx'; 

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <ThemeProvider> 
        <App />
      </ThemeProvider>
  </BrowserRouter>
);

