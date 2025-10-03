import React from "react";
import DetalhesReserva from "../../components/DetalhesReserva";
import ServidorLayout from "../../layouts/ServidorLayout";

const DetalhesReservaServidor = () => {
  return (
    <DetalhesReserva
      title="Detalhes da Reserva"
      backPath="/servidor/minhas-reservas"
      backLabel="Voltar"
      Layout={ServidorLayout}
    />
  );
};

export default DetalhesReservaServidor;
