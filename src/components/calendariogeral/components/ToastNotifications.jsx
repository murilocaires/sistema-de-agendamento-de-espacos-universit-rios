import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export const ToastNotifications = ({ error, successMessage, onCloseError, onCloseSuccess }) => {
    return (
        <>
            {/* Toast de Erro */}
            {error && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                        <AlertCircle className="text-white" size={20} />
                        <span className="text-sm font-medium">{error}</span>
                        <button
                            onClick={onCloseError}
                            className="ml-auto text-white/80 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toast de Sucesso */}
            {successMessage && (
                <div className={`fixed right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${
                    error ? 'top-20' : 'top-4'
                }`}>
                    <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                        <CheckCircle className="text-white" size={20} />
                        <span className="text-sm font-medium">{successMessage}</span>
                        <button
                            onClick={onCloseSuccess}
                            className="ml-auto text-white/80 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

