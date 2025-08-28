
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import { UndoProvider } from '@/contexts/UndoContext';
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import { RequireAuth } from './components/RequireAuth';
import Content from './pages/Content';
import UsersPage from './pages/Users';
import ClientPasswords from './pages/ClientPasswords';
import Audit from './pages/Audit';
import Traffic from './pages/Traffic';
import Sites from './pages/Sites';
import GoogleMyBusiness from './pages/GoogleMyBusiness';
import RSGAvaliacoes from './pages/RSGAvaliacoes';
import Videos from './pages/Videos';
import ContentPadarias from './pages/ContentPadarias';
import { ThemeProvider } from '@/hooks/useTheme';

function App() {
  return (
    <ThemeProvider>
      <UndoProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Tasks />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/content"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Content />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/content-padarias"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <ContentPadarias />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <UsersPage />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/client-passwords"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <ClientPasswords />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/audit"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Audit />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/traffic"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Traffic />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/sites"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Sites />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/google-my-business"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <GoogleMyBusiness />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/rsg-avaliacoes"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <RSGAvaliacoes />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/videos"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Videos />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </UndoProvider>
    </ThemeProvider>
  );
}

export default App;
