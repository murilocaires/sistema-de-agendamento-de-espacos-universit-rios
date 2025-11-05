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
        showDeleteButton={true}
      />
    </StudentLayout>
  );
};

export default HistoricoAluno;
