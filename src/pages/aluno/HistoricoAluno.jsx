import React from "react";
import Historico from "../../components/Historico";
import StudentLayout from "../../layouts/StudentLayout";

const HistoricoAluno = () => {
  return (
    <StudentLayout>
      <Historico
        title="Histórico"
        userType="student"
        showCancelButton={false}
        showDeleteButton={false}
      />
    </StudentLayout>
  );
};

export default HistoricoAluno;
