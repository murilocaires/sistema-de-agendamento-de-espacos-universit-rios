import React from "react";
import NovaReserva from "../../components/NovaReserva";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";

const NovaReservaServidor = () => {
  const { user } = useAuth();
  const userType = user?.role || "servidor";
  const menuItems = getUserMenu(userType);
  const userTypeDisplay = getUserTypeDisplay(userType);

  return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
      <NovaReserva
        title="Nova Reserva"
        userType="servidor"
        showProjectSelection={false}
      />
    </DashboardLayout>
  );
};

export default NovaReservaServidor;
