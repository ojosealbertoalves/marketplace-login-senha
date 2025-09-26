// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  allowedUserTypes = null, 
  requiredPermission = null 
}) => {
  const { isAuthenticated, user, loading, hasPermission } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se requer autenticação mas não está autenticado
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Se não requer autenticação mas está autenticado (ex: página de login)
  if (!requireAuth && isAuthenticated) {
    const redirectTo = location.state?.from || '/';
    return <Navigate to={redirectTo} replace />;
  }

  // Verificar tipos de usuário permitidos
  if (allowedUserTypes && isAuthenticated) {
    if (!allowedUserTypes.includes(user.user_type)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
            <div className="text-red-500 text-5xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Acesso Negado
            </h2>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <p className="text-sm text-gray-500">
              Tipo necessário: {allowedUserTypes.join(', ')}
            </p>
          </div>
        </div>
      );
    }
  }

  // Verificar permissão específica
  if (requiredPermission && isAuthenticated) {
    if (!hasPermission(requiredPermission)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
            <div className="text-orange-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Permissão Insuficiente
            </h2>
            <p className="text-gray-600 mb-4">
              Você não tem a permissão necessária para esta funcionalidade.
            </p>
            <p className="text-sm text-gray-500">
              Permissão necessária: {requiredPermission}
            </p>
          </div>
        </div>
      );
    }
  }

  // Se passou por todas as verificações, renderizar o componente
  return children;
};

export default ProtectedRoute;