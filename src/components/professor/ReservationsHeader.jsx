import React from 'react';
import { motion } from 'framer-motion';

const ReservationsHeader = ({ viewMode, onViewModeChange }) => {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {viewMode === 'my-reservations' ? 'Minhas Reservas' : 'Reservas dos Meus Projetos'}
          </h1>
          <p className="text-gray-700">
            {viewMode === 'my-reservations' 
              ? 'Gerencie suas reservas pessoais de salas' 
              : 'Visualize reservas dos seus projetos de extensão'
            }
          </p>
        </div>
      </div>

      {/* Alternador de visualização */}
      <div className="mb-6">
        <div className="relative">
          <div className="flex space-x-8">
            <motion.button
              type="button"
              onClick={() => onViewModeChange('my-reservations')}
              className="relative px-1 py-2 text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
              whileTap={{ scale: 0.95 }}
            >
              Minhas Reservas
              {viewMode === 'my-reservations' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
            
            <motion.button
              type="button"
              onClick={() => onViewModeChange('project-reservations')}
              className="relative px-1 py-2 text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
              whileTap={{ scale: 0.95 }}
            >
              Reservas dos Meus Projetos
              {viewMode === 'project-reservations' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          </div>
          
          {/* Barra de separação */}
          <div className="mt-4 border-b border-gray-200"></div>
        </div>
      </div>
    </>
  );
};

export default ReservationsHeader;
