import React from "react";
import DetalhesReserva from "../../components/DetalhesReserva";
import StudentLayout from "../../layouts/StudentLayout";

const DetalhesHistorico = () => {
  return (
    <DetalhesReserva
      title="Detalhes do Histórico"
      backPath="/aluno/historico"
      backLabel="Voltar"
      Layout={StudentLayout}
    />
  );
};

export default DetalhesHistorico;
