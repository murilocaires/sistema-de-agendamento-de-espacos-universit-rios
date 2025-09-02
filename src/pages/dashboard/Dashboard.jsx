import React from "react";
import AdminLayout from "../../layouts/AdminLayout";

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Dashboard - Sistema de Agendamentos
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao sistema de agendamentos de espaços universitários!
        </p>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
