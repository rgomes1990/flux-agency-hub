
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Content from './pages/Content';
import Tasks from './pages/Tasks';
import Traffic from './pages/Traffic';
import Users from './pages/Users';
import ClientPasswords from './pages/ClientPasswords';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/content" element={<Content />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/traffic" element={<Traffic />} />
          <Route path="/users" element={<Users />} />
          <Route path="/client-passwords" element={<ClientPasswords />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
