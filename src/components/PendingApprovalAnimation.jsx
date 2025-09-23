import React, { useEffect } from "react";
import { Clock, Users, CheckCircle } from "lucide-react";

const PendingApprovalAnimation = ({ onComplete }) => {
  useEffect(() => {
    // Executar callback após 4 segundos
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
        {/* Ícone de pendência animado */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Clock className="w-10 h-10 text-yellow-600 animate-spin" />
          </div>
        </div>

        {/* Texto de sucesso */}
        <h3 className="text-gray-800 font-bold text-xl mb-3">
          Conta criada com sucesso!
        </h3>
        
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-yellow-600" size={20} />
            <span className="text-yellow-800 font-medium">Aguardando Aprovação</span>
          </div>
          <p className="text-yellow-700 text-sm">
            Sua conta foi criada e está aguardando aprovação de um administrador. 
            Você receberá um email quando sua conta for aprovada.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <CheckCircle className="text-green-600" size={16} />
          <span>Você poderá fazer login após a aprovação</span>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-500 h-2 rounded-full animate-pulse"
            style={{ width: "100%" }}
          ></div>
        </div>
        
        <p className="text-gray-500 text-xs mt-2">
          Redirecionando para a página de login...
        </p>
      </div>
    </div>
  );
};

export default PendingApprovalAnimation;
