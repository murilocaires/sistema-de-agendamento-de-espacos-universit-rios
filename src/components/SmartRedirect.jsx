import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SmartRedirect = () => {
  const { user } = useAuth();

  // Função para obter o dashboard correto baseado no papel do usuário
  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'professor':
      case 'servidor':
        return '/professor/projetos';
      case 'coordenador':
        return '/coordenador/dashboard';
      case 'portaria':
        return '/portaria/reservas';
      case 'aluno':
        return '/aluno/dashboard';
      default:
        return '/dashboard';
    }
  };

  // Se o usuário está autenticado, redirecionar para o dashboard correto
  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  // Se não está autenticado, redirecionar para o dashboard padrão
  return <Navigate to="/dashboard" replace />;
};

export default SmartRedirect;
