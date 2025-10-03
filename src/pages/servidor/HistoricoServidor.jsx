import React from "react";
import Historico from "../../components/Historico";
import ServidorLayout from "../../layouts/ServidorLayout";

const HistoricoServidor = () => {
  return (
    <ServidorLayout>
      <Historico
        title="Histórico"
        userType="servidor"
        showCancelButton={false}
        showDeleteButton={false}
      />
    </ServidorLayout>
  );
};

export default HistoricoServidor;
