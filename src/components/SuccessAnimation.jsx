import React, { useEffect } from "react";

const SuccessAnimation = ({ onComplete }) => {
  useEffect(() => {
    // Executar callback após 2 segundos
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center shadow-2xl">
        {/* Ícone de sucesso animado */}
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg
              className="w-8 h-8 text-green-600 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Texto de sucesso */}
        <h3 className="text-gray-800 font-bold text-lg mb-2">
          Cadastro realizado com sucesso!
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Redirecionando para a página de login...
        </p>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full animate-pulse"
            style={{ width: "100%" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation;
