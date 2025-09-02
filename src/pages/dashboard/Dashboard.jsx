import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import DebugUsers from "../../components/DebugUsers";

const Dashboard = () => {
  const { user } = useAuth();
  const userType = user?.role || "admin";
  const menuItems = getUserMenu(userType);
  const userTypeDisplay = getUserTypeDisplay(userType);

  return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Dashboard - Sistema de Agendamentos
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao sistema de agendamentos de espaços universitários!
        </p>
        {user && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              <strong>Usuário:</strong> {user.name} ({userTypeDisplay})
            </p>
          </div>
        )}
      </div>
      <DebugUsers />
    </DashboardLayout>
  );
};

export default Dashboard;
