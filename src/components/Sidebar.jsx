import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ClipboardList,
  Users,
  DoorClosed,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

const Sidebar = ({ menuItems = [], userType = "ADMIN" }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Menu padrão para admin se não for fornecido
  const defaultMenuItems = useMemo(() => [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "reservas", label: "Reservas", icon: ClipboardList },
    { id: "usuarios", label: "Usuários", icon: Users },
    { id: "salas", label: "Salas", icon: DoorClosed },
  ], []);

  const finalMenuItems = useMemo(() => 
    menuItems.length > 0 ? menuItems : defaultMenuItems, 
    [menuItems, defaultMenuItems]
  );


  // Atualizar link ativo baseado na rota atual
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = finalMenuItems.find(item => item.path === currentPath);
    if (activeItem) {
      setActiveLink(activeItem.id);
    }
  }, [location.pathname, finalMenuItems]);

  const handleLogout = () => {
    logout();
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLinkClick = (item) => {
    setActiveLink(item.id);
    if (item.path) {
      navigate(item.path);
    }
    // Fechar menu mobile após navegação
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {!isMobileMenuOpen && (      
        <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-blue-base text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>)}


      {/* Overlay para mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[45]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static
          w-[216px] h-screen bg-gray-100 flex flex-col z-[50]
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="mt-9 px-6 pb-[25px] border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-12 h-12 bg-blue-base rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-base rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold font-lato">SIRU</h1>
              <p className="text-gray-400 text-xs font-lato">{userType}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 mt-5 overflow-y-auto">
          {finalMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLinkClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-5 rounded-[5px] transition-all duration-200 focus:outline-none ${
                activeLink === item.id
                  ? "bg-blue-base text-white"
                  : "text-gray-400 hover:bg-gray-200"
              }`}
            >
              <item.icon size={18} />
              <span className="font-lato text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Menu */}
        <div className="p-4 relative">
          <div className="relative" ref={dropdownRef}>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-lato font-medium">
                {user ? user.name : "Usuário Adm"}
              </p>
              <p className="text-gray-400 text-xs font-lato">
                {user ? user.email : "user.adm@test.com"}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-feedback-danger hover:bg-gray-200 rounded-[5px] transition-colors focus:outline-none mt-2"
            >
              <LogOut size={16} />
              <span className="font-lato text-sm">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Usar React.memo para evitar re-renderizações desnecessárias
export default memo(Sidebar, (prevProps, nextProps) => {
  // Comparar props para determinar se deve re-renderizar
  return (
    prevProps.userType === nextProps.userType &&
    prevProps.menuItems === nextProps.menuItems
  );
});
