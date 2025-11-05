import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';

const ReservationsHeader = ({ 
  viewMode, 
  onViewModeChange,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-0 mb-4 md:mb-6">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-800">
            {viewMode === 'my-reservations' ? 'Minhas Reservas' : 'Reservas dos Meus Projetos'}
          </h1>
          <p className="text-xs md:text-sm text-gray-700">
            {viewMode === 'my-reservations' 
              ? 'Gerencie suas reservas pessoais de salas' 
              : 'Visualize reservas dos seus projetos de extensão'
            }
          </p>
        </div>
      </div>

      {/* Alternador de visualização */}
      <div className="mb-4 md:mb-6">
        <div className="relative">
          <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:justify-between md:items-center">
            <div className="flex space-x-4 md:space-x-8 overflow-x-auto">
              <motion.button
                type="button"
                onClick={() => onViewModeChange('my-reservations')}
                className="relative px-0 md:px-1 py-2 text-sm md:text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 whitespace-nowrap"
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
                className="relative px-0 md:px-1 py-2 text-sm md:text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 whitespace-nowrap"
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

            {/* Buscador e Filtro de Status - sempre visível */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Buscador */}
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-4.5 md:h-4.5" size={18} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full sm:w-56 md:w-64 pl-8 md:pl-10 pr-3 md:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Filtro de Status */}
              <div className="relative w-full sm:w-auto">
                <Filter className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-4.5 md:h-4.5" size={18} />
                <select
                  value={statusFilter || 'all'}
                  onChange={(e) => onStatusFilterChange?.(e.target.value)}
                  className="w-full sm:w-auto sm:min-w-[180px] pl-8 md:pl-10 pr-3 md:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendentes</option>
                  <option value="approved">Aprovadas</option>
                  {viewMode === 'project-reservations' && (
                    <option value="professor_approved">Aprovadas por Mim</option>
                  )}
                  <option value="rejected">Rejeitadas</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Barra de separação */}
          <div className="mt-3 md:mt-4 border-b border-gray-200"></div>
        </div>
      </div>
    </>
  );
};

export default ReservationsHeader;
