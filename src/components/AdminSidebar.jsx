import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ClipboardList,
  Users,
  DoorClosed,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const AdminSidebar = () => {
  const { logout, user } = useAuth();
  const [activeLink, setActiveLink] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "reservas", label: "Reservas", icon: ClipboardList },
    { id: "usuarios", label: "Usuários", icon: Users },
    { id: "salas", label: "Salas", icon: DoorClosed },
  ];

  const handleLinkClick = (id) => {
    setActiveLink(id);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-[216px] h-screen bg-gray-100 flex flex-col">
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
            <p className="text-gray-400 text-xs font-lato">ADMIN</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 mt-5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleLinkClick(item.id)}
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
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-[5px] hover:bg-gray-200 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 bg-blue-base rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold font-lato">
                {user
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "UA"}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-lato font-medium">
                {user ? user.name : "Usuário Adm"}
              </p>
              <p className="text-gray-400 text-xs font-lato">
                {user ? user.email : "user.adm@test.com"}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute -top-10 left-full ml-6 bg-gray-100 rounded-[5px] shadow-lg border border-gray-300 w-48">
              <div className="p-3">
                <p className="text-gray-400 text-xs font-lato font-medium uppercase mb-2">
                  OPÇÕES
                </p>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-200 rounded-[5px] transition-colors focus:outline-none">
                    <User size={16} />
                    <span className="font-lato text-sm">Perfil</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-feedback-danger hover:bg-gray-200 rounded-[5px] transition-colors focus:outline-none"
                  >
                    <LogOut size={16} />
                    <span className="font-lato text-sm">Sair</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
