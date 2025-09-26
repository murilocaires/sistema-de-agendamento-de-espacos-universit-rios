import React from "react";
import MinhasReservas from "../../components/MinhasReservas";
import CoordenadorLayout from "../../layouts/CoordenadorLayout";

const MinhasReservasCoordenador = () => {
  return (
    <CoordenadorLayout>
      <MinhasReservas
        title="Reservas do Departamento"
        userType="coordenador"
        showCancelButton={true}
        showDeleteButton={false}
      />
    </CoordenadorLayout>
  );
};

export default MinhasReservasCoordenador;
