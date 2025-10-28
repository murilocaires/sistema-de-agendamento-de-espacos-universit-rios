import React from "react";
import Historico from "../../components/Historico";
import ProfessorLayout from "../../layouts/ProfessorLayout";

const HistoricoProfessor = () => {
  return (
    <ProfessorLayout>
      <Historico
        title="Histórico"
        userType="professor"
        showCancelButton={false}
        showDeleteButton={false}
      />
    </ProfessorLayout>
  );
};

export default HistoricoProfessor;

