
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

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

  // Se está autenticado, vai para dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Index;
