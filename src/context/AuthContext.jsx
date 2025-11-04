import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authenticateUser, verifyToken } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        try {
          // Verificar se o token ainda é válido
          const user = await verifyToken();
          setIsAuthenticated(true);
          setUser(user);
        } catch (error) {
          // Token inválido, limpar dados locais
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          setIsAuthenticated(false);
          setUser(null);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await authenticateUser(email, password);

      setIsAuthenticated(true);
      setUser(userData);

      // Redirecionar para o dashboard específico baseado no tipo de usuário
      const getDashboardPath = (role) => {
        switch (role) {
          case "admin":
            return "/admin/dashboard";
          case "professor":
          case "servidor":
            return "/servidor/minhas-reservas";
          case "coordenador":
            return "/coordenador/dashboard";
          case "portaria":
            return "/portaria/reservas";
          case "aluno":
            return "/aluno/reservas";
          case "servidor":
            return "/servidor/minhas-reservas";
          default:
            return "/dashboard";
        }
      };

      navigate(getDashboardPath(userData.role));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    setIsAuthenticated(false);
    setUser(null);

    // Redirecionar para a página de login
    navigate("/login");
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
