import React from "react";
import MinhasReservas from "../../components/MinhasReservas";
import ServidorLayout from "../../layouts/ServidorLayout";

const MinhasReservasServidor = () => {
  return (
    <ServidorLayout>
      <MinhasReservas
        title="Minhas Reservas"
        userType="servidor"
        showCancelButton={true}
        showDeleteButton={true}
      />
    </ServidorLayout>
  );
};

export default MinhasReservasServidor;
