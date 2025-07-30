import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import logger from './utils/logger'

logger.log('🚀 Starting React application...');

const rootElement = document.getElementById('root');
logger.log('📦 Root element found:', rootElement);

if (!rootElement) {
  logger.error('❌ Root element not found!');
} else {
  logger.log('✅ Root element exists, creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  logger.log('🔄 Rendering App component...');
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
  logger.log('✅ App component rendered successfully');
}