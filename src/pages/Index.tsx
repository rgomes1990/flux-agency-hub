
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Se não está autenticado, vai para auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se está autenticado e está na página inicial, vai para dashboard
  // Caso contrário, deixa o usuário na página atual
  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  return null;
};

export default Index;
