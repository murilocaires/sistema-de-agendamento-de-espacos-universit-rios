import React from "react";
import NovaReserva from "../../components/NovaReserva";
import AdminLayout from "../../layouts/AdminLayout";

const NovaReservaAdmin = () => {
  return (
    <AdminLayout>
      <NovaReserva
        title="Nova Reserva"
        userType="admin"
        showProjectSelection={false}
      />
    </AdminLayout>
  );
};

export default NovaReservaAdmin;
