import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PetProvider } from './context/PetContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationContainer from './components/NotificationContainer';
import Dashboard from './pages/Dashboard';
import Pets from './pages/Pets';
import Tasks from './pages/Tasks';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
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
          <NotificationContainer />
        </PetProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;