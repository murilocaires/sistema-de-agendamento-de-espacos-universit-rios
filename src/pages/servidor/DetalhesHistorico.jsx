import React from "react";
import DetalhesReserva from "../../components/DetalhesReserva";
import ServidorLayout from "../../layouts/ServidorLayout";

const DetalhesHistoricoServidor = () => {
  return (
    <DetalhesReserva
      title="Detalhes do Histórico"
      backPath="/servidor/historico"
      backLabel="Voltar"
      Layout={ServidorLayout}
    />
  );
};

export default DetalhesHistoricoServidor;
