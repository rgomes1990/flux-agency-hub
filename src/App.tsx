
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
import Users from './pages/Users';
import ClientPasswords from './pages/ClientPasswords';
import Audit from './pages/Audit';
import NotFound from './pages/NotFound';

function RoutePreserver() {
  const location = useLocation();
  
  useEffect(() => {
    // Marcar que estamos navegando normalmente (não refresh)
    sessionStorage.setItem('pageRefreshed', 'false');
    sessionStorage.setItem('lastRoute', location.pathname);
  }, [location.pathname]);

  // Detectar refresh usando beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('pageRefreshed', 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}

function App() {
  useEffect(() => {
    const savedRoute = sessionStorage.getItem('lastRoute');
    const currentPath = window.location.pathname;
    
    // Usar múltiplas formas de detectar refresh da página
    const navigation = window.performance?.getEntriesByType('navigation')?.[0] as PerformanceNavigationTiming;
    const isPageRefresh = 
      navigation?.type === 'reload' || 
      window.performance?.navigation?.type === 1 ||
      document.referrer === window.location.href ||
      sessionStorage.getItem('pageRefreshed') === 'true';
    
    console.log('App useEffect:', { 
      savedRoute, 
      currentPath, 
      isPageRefresh,
      navigationType: navigation?.type,
      performanceType: window.performance?.navigation?.type,
      referrer: document.referrer,
      sessionFlag: sessionStorage.getItem('pageRefreshed')
    });
    
    // Se for refresh, marcar flag e não redirecionar
    if (isPageRefresh) {
      console.log('Page refresh detected - staying on current page:', currentPath);
      sessionStorage.setItem('pageRefreshed', 'false'); // Reset flag
      return;
    }
    
    // Só redirecionar em navegação normal (não refresh)
    if (savedRoute && savedRoute !== '/' && savedRoute !== '/auth' && savedRoute !== currentPath) {
      if (currentPath === '/' || currentPath === '/dashboard') {
        console.log('Normal navigation - redirecting to saved route:', savedRoute);
        window.location.replace(savedRoute);
        return;
      }
    }
    
    // Limpar flag se chegou até aqui
    sessionStorage.removeItem('pageRefreshed');
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
