import React from "react";
import MinhasReservas from "../../components/aluno/MinhasReservas";
import StudentLayout from "../../layouts/StudentLayout";

const ReservasAluno = () => {
  return (
    <StudentLayout>
      <MinhasReservas
        title="Minhas Reservas"
        userType="student"
        showCancelButton={true}
        showDeleteButton={false}
      />
    </StudentLayout>
  );
};

export default ReservasAluno;
