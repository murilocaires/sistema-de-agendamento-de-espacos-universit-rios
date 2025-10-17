import React from "react";
import NovaReserva from "../../components/NovaReserva";
import StudentLayout from "../../layouts/StudentLayout";

const NovaReservaAluno = () => {
  return (
    <StudentLayout>
      <NovaReserva
        title="Nova Reserva"
        userType="student"
        showProjectSelection={true}
      />
    </StudentLayout>
  );
};

export default NovaReservaAluno;