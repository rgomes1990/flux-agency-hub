
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { UndoProvider } from './contexts/UndoContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Auth from './pages/Auth';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Content from './pages/Content';
import Sites from './pages/Sites';
import Tasks from './pages/Tasks';
import Traffic from './pages/Traffic';
import GoogleMyBusiness from './pages/GoogleMyBusiness';
import RSGAvaliacoes from './pages/RSGAvaliacoes';
import Users from './pages/Users';
import ClientPasswords from './pages/ClientPasswords';
import Audit from './pages/Audit';
import NotFound from './pages/NotFound';

function RoutePreserver() {
  const location = useLocation();
  
  useEffect(() => {
    sessionStorage.setItem('lastRoute', location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  useEffect(() => {
    // Simplesmente não fazer nenhum redirecionamento automático
    console.log('App initialized - staying on current page:', window.location.pathname);
  }, []);

  return (
    <AuthProvider>
      <UndoProvider>
        <Router>
          <RoutePreserver />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/content" element={
            <ProtectedRoute>
              <MainLayout>
                <Content />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/sites" element={
            <ProtectedRoute>
              <MainLayout>
                <Sites />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <MainLayout>
                <Tasks />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/traffic" element={
            <ProtectedRoute>
              <MainLayout>
                <Traffic />
              </MainLayout>
            </ProtectedRoute>
          } />
            <Route path="/google-my-business" element={
              <ProtectedRoute>
                <MainLayout>
                  <GoogleMyBusiness />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/rsg-avaliacoes" element={
              <ProtectedRoute>
                <MainLayout>
                  <RSGAvaliacoes />
                </MainLayout>
              </ProtectedRoute>
            } />
          <Route path="/users" element={
            <ProtectedRoute>
              <MainLayout>
                <Users />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/client-passwords" element={
            <ProtectedRoute>
              <MainLayout>
                <ClientPasswords />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/audit" element={
            <ProtectedRoute>
              <MainLayout>
                <Audit />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      </UndoProvider>
    </AuthProvider>
  );
}

export default App;
