import React from "react";
import DetalhesReserva from "../../components/DetalhesReserva";
import ProfessorLayout from "../../layouts/ProfessorLayout";

const DetalhesHistorico = () => {
  return (
    <DetalhesReserva
      title="Detalhes do Histórico"
      backPath="/professor/historico"
      backLabel="Voltar"
      Layout={ProfessorLayout}
    />
  );
};

export default DetalhesHistorico;


