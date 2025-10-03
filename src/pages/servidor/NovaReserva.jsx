import React from "react";
import NovaReserva from "../../components/NovaReserva";
import ServidorLayout from "../../layouts/ServidorLayout";

const NovaReservaServidor = () => {
  return (
    <ServidorLayout>
      <NovaReserva
        title="Nova Reserva"
        userType="servidor"
        showProjectSelection={false}
      />
    </ServidorLayout>
  );
};

export default NovaReservaServidor;
