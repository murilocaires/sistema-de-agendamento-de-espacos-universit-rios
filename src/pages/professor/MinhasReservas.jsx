import React, { useState, useEffect } from "react";
import ProfessorLayout from "../../layouts/ProfessorLayout";
import { useAuth } from "../../context/AuthContext";
import { 
  getReservations,
  getRooms,
  getProjects
} from "../../services/authService";

// Componentes
import ReservationsHeader from "../../components/professor/ReservationsHeader";
import ReservationsFilters from "../../components/professor/ReservationsFilters";
import ReservationsTable from "../../components/professor/ReservationsTable";
import ReservationDetailsModal from "../../components/professor/ReservationDetailsModal";
import ErrorToast from "../../components/professor/ErrorToast";

const MinhasReservas = () => {
  const { user } = useAuth();

  // Estados
  const [reservations, setReservations] = useState([]);
  const [projectReservations, setProjectReservations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [viewMode, setViewMode] = useState('my-reservations'); // 'my-reservations' | 'project-reservations'

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [reservationsData, roomsData, projectsData] = await Promise.all([
        getReservations({ user_id: user?.id }),
        getRooms(),
        getProjects({ professor_id: user?.id })
      ]);
      
      
      setReservations(reservationsData || []);
      setRooms(roomsData || []);
      setProjects(projectsData || []);
      
      // Carregar reservas dos projetos
      await loadProjectReservations(projectsData || []);
      
    } catch (err) {
      setError("Erro ao carregar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar reservas dos projetos
  const loadProjectReservations = async (projectsList) => {
    try {
      if (!projectsList || projectsList.length === 0) {
        setProjectReservations([]);
        return;
      }

      // Buscar reservas de todos os projetos
      const projectReservationsPromises = projectsList.map(async (project) => {
        try {
          const projectReservations = await getReservations({ project_id: project.id });
          return projectReservations || [];
        } catch (error) {
          console.error(`Erro ao carregar reservas do projeto ${project.name}:`, error);
          return [];
        }
      });

      const allProjectReservations = await Promise.all(projectReservationsPromises);
      const flattenedReservations = allProjectReservations.flat();
      
      
      setProjectReservations(flattenedReservations);
    } catch (error) {
      console.error('Erro ao carregar reservas dos projetos:', error);
      setProjectReservations([]);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user?.id]);

  // Filtrar reservas baseado no modo de visualização
  const getCurrentReservations = () => {
    return viewMode === 'my-reservations' ? reservations : projectReservations;
  };

  const filteredReservations = getCurrentReservations().filter(reservation => {
    const matchesSearch = 
      reservation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.room_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Abrir modal de detalhes
  const openModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };


  return (
    <ProfessorLayout>
      <div className="p-8">
        <ReservationsHeader 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
        />

        <ErrorToast 
          error={error} 
          onClose={() => setError("")} 
        />

        <ReservationsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <ReservationsTable
          reservations={filteredReservations}
          loading={loading}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          viewMode={viewMode}
          onReservationClick={openModal}
        />

        <ReservationDetailsModal
          isOpen={showModal}
          onClose={closeModal}
          reservation={selectedReservation}
        />
      </div>
    </ProfessorLayout>
  );
};

export default MinhasReservas;
