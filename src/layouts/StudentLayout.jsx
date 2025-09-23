import React, { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserMenu, getUserTypeDisplay } from "../config/userMenus";
import Sidebar from "../components/Sidebar";
import NotificationIcon from "../components/NotificationIcon";

const StudentLayout = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  
  // Memoizar os valores do menu para evitar recriações desnecessárias
  const userType = useMemo(() => user?.role || "aluno", [user?.role]);
  
  // Usar cache para estabilizar a referência do menu
  const menuItems = useMemo(() => getUserMenu(userType), [userType]);
  
  const userTypeDisplay = useMemo(() => getUserTypeDisplay(userType), [userType]);

  // Aguardar carregamento da autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 h-screen">
      {/* Sidebar - Estável e não recarrega */}
      <Sidebar userType={userTypeDisplay} menuItems={menuItems} />

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-tl-[20px] overflow-y-auto main-content-scroll">
        {children}
      </div>

      {/* Ícone de Notificações Flutuante */}
      <NotificationIcon />
    </div>
  );
};

export default StudentLayout;
