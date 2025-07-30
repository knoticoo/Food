import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PetProvider } from './context/PetContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Pets from './pages/Pets';
import Tasks from './pages/Tasks';
import History from './pages/History';
import Settings from './pages/Settings';
import logger from './utils/logger';

function App() {
  logger.log('🏠 App component rendering...');
  
  try {
    return (
      <ErrorBoundary>
        <div>
          <div style={{ 
            position: 'fixed', 
            top: '0', 
            left: '0', 
            background: 'red', 
            color: 'white', 
            padding: '5px', 
            zIndex: 9999,
            fontSize: '12px'
          }}>
            App is rendering - {new Date().toLocaleTimeString()}
          </div>
          <PetProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pets" element={<Pets />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </PetProvider>
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    logger.error('❌ Error in App component:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error occurred</h1>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
      </div>
    );
  }
}

export default App;