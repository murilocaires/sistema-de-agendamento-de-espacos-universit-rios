import React from "react";
import DetalhesReserva from "../../components/DetalhesReserva";
import StudentLayout from "../../layouts/StudentLayout";

const DetalhesReservaAluno = () => {
  return (
    <DetalhesReserva
      title="Detalhes da Reserva"
      backPath="/aluno/reservas"
      backLabel="Voltar"
      Layout={StudentLayout}
    />
  );
};

export default DetalhesReservaAluno;
