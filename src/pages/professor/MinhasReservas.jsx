import React from "react";
import MinhasReservas from "../../components/MinhasReservas";
import ProfessorLayout from "../../layouts/ProfessorLayout";

const MinhasReservasProfessor = () => {
  return (
    <ProfessorLayout>
      <MinhasReservas
        title="Minhas Reservas"
        userType="professor"
        showCancelButton={true}
        showDeleteButton={true}
      />
    </ProfessorLayout>
  );
};

export default MinhasReservasProfessor;
