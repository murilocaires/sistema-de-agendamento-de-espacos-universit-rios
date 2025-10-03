import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserMenu, getUserTypeDisplay } from "../config/userMenus";
import Sidebar from "../components/Sidebar";
import NotificationIcon from "../components/NotificationIcon";
import { Menu, X } from "lucide-react";

const ServidorLayout = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Memoizar os valores do menu para evitar recriações desnecessárias
  const userType = useMemo(() => user?.role || "servidor", [user?.role]);
  const menuItems = useMemo(() => getUserMenu(userType), [userType]);
  const userTypeDisplay = useMemo(
    () => getUserTypeDisplay(userType),
    [userType]
  );

  // Aguardar carregamento da autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 h-screen">
      {/* Mobile Header */}
      <div
        className="md:hidden px-4 flex items-center justify-between border-b border-gray-200"
        style={{
          height: "92px",
          backgroundColor: "#151619",
        }}
      >
        {/* Menu Hambúrguer */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center transition-colors"
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#1E2024",
            borderRadius: "5px",
          }}
        >
          {isMobileMenuOpen ? (
            <X size={20} color="#ffffff" />
          ) : (
            <Menu size={20} color="#ffffff" />
          )}
        </button>

        {/* Logo e Título */}
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
          <div className="text-left">
            <h1
              className="font-bold text-sm leading-tight"
              style={{ color: "#ffffff" }}
            >
              SISTEMA DE AGENDAMENTOS
            </h1>
            <p className="text-xs uppercase" style={{ color: "#2E3DA3" }}>
              {userTypeDisplay}
            </p>
          </div>
        </div>

        {/* Avatar do Usuário */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "U"}
          </span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-gray-100 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar userType={userTypeDisplay} menuItems={menuItems} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar userType={userTypeDisplay} menuItems={menuItems} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-tl-[20px] rounded-tr-[20px] overflow-y-auto main-content-scroll shadow-lg">
        {children}
      </div>

      {/* Ícone de Notificações Flutuante */}
      <NotificationIcon />
    </div>
  );
};

export default ServidorLayout;
