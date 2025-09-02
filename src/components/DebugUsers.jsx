import React from "react";
import { checkUsers, resetDatabase } from "../services/authService";

const DebugUsers = () => {
  const handleCheckUsers = () => {
    checkUsers();
  };

  const handleResetDatabase = () => {
    resetDatabase();
  };

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="text-sm font-bold mb-2">Debug - Usuários</h3>
      <div className="space-y-2">
        <button
          onClick={handleCheckUsers}
          className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Verificar Usuários
        </button>
        <button
          onClick={handleResetDatabase}
          className="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Resetar Banco
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        Abra o console (F12) para ver os logs
      </p>
    </div>
  );
};

export default DebugUsers;
