import React from "react";
import NovaReserva from "../../components/reservas/NovaReserva";
import ProfessorLayout from "../../layouts/ProfessorLayout";

const NovaReservaProfessor = () => {
    return (
      <ProfessorLayout>
      <NovaReserva
        title="Nova Reserva"
        userType="professor"
        showProjectSelection={true}
      />
    </ProfessorLayout>
  );
};

export default NovaReservaProfessor;
