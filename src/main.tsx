import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

console.log('🚀 Starting React application...');

const rootElement = document.getElementById('root');
console.log('📦 Root element found:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element exists, creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('🔄 Rendering App component...');
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
  console.log('✅ App component rendered successfully');
}