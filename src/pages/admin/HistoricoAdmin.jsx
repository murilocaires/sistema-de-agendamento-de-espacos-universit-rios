import React from "react";
import Historico from "../../components/Historico";
import AdminLayout from "../../layouts/AdminLayout";

const HistoricoAdmin = () => {
  return (
    <AdminLayout>
      <Historico
        title="Histórico"
        userType="admin"
        showCancelButton={false}
        showDeleteButton={true}
      />
    </AdminLayout>
  );
};

export default HistoricoAdmin;
