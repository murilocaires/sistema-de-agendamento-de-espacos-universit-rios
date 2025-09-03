import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getUserMenu, getUserTypeDisplay } from "../../config/userMenus";
import { useAuth } from "../../context/AuthContext";
import { 
  getRooms, 
  createRoom, 
  updateRoom, 
  deleteRoom 
} from "../../services/authService";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  DoorClosed,
  AlertCircle,
  CheckCircle,
  X,
  Users,
  MapPin,
  Monitor,
  Wifi,
  Wind,
  Lock,
  Power,
  PowerOff
} from "lucide-react";

const Rooms = () => {
  const { user } = useAuth();
  const userType = user?.role || "admin";
  const menuItems = getUserMenu(userType);
  const userTypeDisplay = getUserTypeDisplay(userType);

  // Estados
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    location: "",
    has_projector: false,
    has_internet: false,
    has_air_conditioning: false,
    is_fixed_reservation: false,
    description: "",
    is_active: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Carregar salas
  const loadRooms = async () => {
    try {
      setLoading(true);
      setError("");
      const roomsData = await getRooms();
      setRooms(roomsData || []);
    } catch (err) {
      console.error("Erro ao carregar salas:", err);
      setError("Erro ao carregar salas: " + (err.message || "Erro desconhecido"));
      setRooms([]); // Garantir que rooms seja um array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Filtrar salas
  const filteredRooms = React.useMemo(() => {
    try {
      if (!Array.isArray(rooms)) return [];
      if (!searchTerm.trim()) return rooms;
      
      const searchLower = searchTerm.toLowerCase();
      return rooms.filter(room => {
        if (!room) return false;
        return (
          (room.name && room.name.toLowerCase().includes(searchLower)) ||
          (room.location && room.location.toLowerCase().includes(searchLower)) ||
          (room.description && room.description.toLowerCase().includes(searchLower))
        );
      });
    } catch (error) {
      console.error("Erro ao filtrar salas:", error);
      return [];
    }
  }, [rooms, searchTerm]);

  // Abrir modal
  const openModal = (mode, roomData = null) => {
    setModalMode(mode);
    setSelectedRoom(roomData);
    setFormError("");
    setSuccessMessage("");
    
    if (mode === "create") {
      setFormData({
        name: "",
        capacity: "",
        location: "",
        has_projector: false,
        has_internet: false,
        has_air_conditioning: false,
        is_fixed_reservation: false,
        description: "",
        is_active: true
      });
    } else if (mode === "edit" && roomData) {
      setFormData({
        name: roomData.name,
        capacity: roomData.capacity.toString(),
        location: roomData.location,
        has_projector: roomData.has_projector,
        has_internet: roomData.has_internet,
        has_air_conditioning: roomData.has_air_conditioning,
        is_fixed_reservation: roomData.is_fixed_reservation,
        description: roomData.description || "",
        is_active: roomData.is_active
      });
    }
    
    setShowModal(true);
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
    setFormData({
      name: "",
      capacity: "",
      location: "",
      has_projector: false,
      has_internet: false,
      has_air_conditioning: false,
      is_fixed_reservation: false,
      description: "",
      is_active: true
    });
    setFormError("");
    setSuccessMessage("");
  };

  // Manipular mudanças no formulário
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Salvar sala
  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const roomData = {
        ...formData,
        capacity: parseInt(formData.capacity)
      };

      if (modalMode === "create") {
        await createRoom(roomData);
        setSuccessMessage("Sala criada com sucesso!");
      } else if (modalMode === "edit") {
        await updateRoom(selectedRoom.id, roomData);
        setSuccessMessage("Sala atualizada com sucesso!");
      }
      
      await loadRooms();
      setTimeout(() => {
        closeModal();
      }, 1500);
      
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Deletar/Desativar sala
  const handleDelete = async (roomId, roomName) => {
    if (window.confirm(`Tem certeza que deseja desativar a sala "${roomName}"?`)) {
      try {
        await deleteRoom(roomId);
        await loadRooms();
        setSuccessMessage("Sala desativada com sucesso!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError("Erro ao desativar sala: " + err.message);
        setTimeout(() => setError(""), 5000);
      }
    }
  };

  // Obter ícones de recursos
  const getResourceIcons = (room) => {
    const icons = [];
    if (room.has_projector) icons.push(<Monitor key="projector" className="text-blue-600" size={16} title="Projetor" />);
    if (room.has_internet) icons.push(<Wifi key="internet" className="text-green-600" size={16} title="Internet" />);
    if (room.has_air_conditioning) icons.push(<Wind key="ac" className="text-cyan-600" size={16} title="Ar Condicionado" />);
    if (room.is_fixed_reservation) icons.push(<Lock key="fixed" className="text-orange-600" size={16} title="Reserva Fixa" />);
    return icons;
  };

  // Obter cor do status
  const getStatusColor = (isActive) => {
    return isActive 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  return (
    <DashboardLayout userType={userTypeDisplay} menuItems={menuItems}>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Gerenciar Salas
            </h1>
            <p className="text-gray-700">
              Visualize e gerencie todas as salas do sistema
            </p>
          </div>
          <button
            onClick={() => openModal("create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Sala
          </button>
        </div>

        {/* Toast de Erro */}
        {error && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                <AlertCircle className="text-white" size={20} />
                <span className="text-sm font-medium">{error}</span>
                <button
                    onClick={() => setError("")}
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
                    onClick={() => setSuccessMessage("")}
                    className="ml-auto text-white/80 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
        )}

        {/* Estatísticas */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">Total de Salas</p>
                <p className="text-2xl font-bold text-gray-800">{rooms.length}</p>
              </div>
              <DoorClosed className="text-gray-700" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">Salas Ativas</p>
                <p className="text-2xl font-bold text-green-600">{rooms.filter(r => r.is_active).length}</p>
              </div>
              <Power className="text-green-400" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">Salas Inativas</p>
                <p className="text-2xl font-bold text-red-600">{rooms.filter(r => !r.is_active).length}</p>
              </div>
              <PowerOff className="text-red-400" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">Capacidade Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {rooms.reduce((sum, room) => sum + room.capacity, 0)}
                </p>
              </div>
              <Users className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, localização ou descrição..."
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Grid de salas */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-800">Carregando salas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms && filteredRooms.length > 0 ? filteredRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
                {/* Header do card */}
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{room.name}</h3>
                      <div className="flex items-center gap-1 text-gray-700 mt-1">
                        <MapPin size={14} />
                        <span className="text-sm">{room.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal("edit", room)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      {room.is_active && (
                        <button
                          onClick={() => handleDelete(room.id, room.name)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Desativar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conteúdo do card */}
                <div className="p-4">
                  {/* Capacidade e Status */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1">
                      <Users size={16} className="text-gray-700" />
                      <span className="text-sm text-gray-800">{room.capacity} pessoas</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.is_active)}`}>
                      {room.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  {/* Recursos */}
                  <div className="flex gap-2 mb-3">
                    {getResourceIcons(room)}
                    {getResourceIcons(room).length === 0 && (
                      <span className="text-xs text-gray-700">Sem recursos especiais</span>
                    )}
                  </div>

                  {/* Descrição */}
                  {room.description && (
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {room.description}
                    </p>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8">
                <DoorClosed className="mx-auto h-12 w-12 text-gray-700" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma sala encontrada</h3>
                <p className="mt-1 text-sm text-gray-700">
                  {searchTerm ? "Tente ajustar os filtros de busca." : "Comece criando uma nova sala."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalMode === "create" ? "Nova Sala" : "Editar Sala"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-700 hover:text-gray-800"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Toast de Erro do Formulário */}
              {formError && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                        <AlertCircle className="text-white" size={20} />
                        <span className="text-sm font-medium">{formError}</span>
                        <button
                            onClick={() => setFormError("")}
                            className="ml-auto text-white/80 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
              )}

              {/* Toast de Sucesso do Formulário */}
              {successMessage && (
                <div className={`fixed right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${
                    formError ? 'top-20' : 'top-4'
                }`}>
                    <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
                        <CheckCircle className="text-white" size={20} />
                        <span className="text-sm font-medium">{successMessage}</span>
                        <button
                            onClick={() => setSuccessMessage("")}
                            className="ml-auto text-white/80 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleSave} className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Sala
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Capacidade e Localização */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacidade
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Localização
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: Bloco A - 1º Andar"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Recursos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recursos Disponíveis
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center">
                      <div className="relative mr-2">
                        <input
                          type="checkbox"
                          name="has_projector"
                          checked={formData.has_projector}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-700 peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-focus:border-blue-500 transition-all duration-200 cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:border-gray-400">
                          {formData.has_projector && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <Monitor size={16} className="mr-1" />
                      Projetor
                    </label>
                    <label className="flex items-center">
                      <div className="relative mr-2">
                        <input
                          type="checkbox"
                          name="has_internet"
                          checked={formData.has_internet}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-700 peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-focus:border-blue-500 transition-all duration-200 cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:border-gray-400">
                          {formData.has_internet && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <Wifi size={16} className="mr-1" />
                      Internet
                    </label>
                    <label className="flex items-center">
                      <div className="relative mr-2">
                        <input
                          type="checkbox"
                          name="has_air_conditioning"
                          checked={formData.has_air_conditioning}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-700 peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-focus:border-blue-500 transition-all duration-200 cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:border-gray-400">
                          {formData.has_air_conditioning && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <Wind size={16} className="mr-1" />
                      Ar Condicionado
                    </label>
                    <label className="flex items-center">
                      <div className="relative mr-2">
                        <input
                          type="checkbox"
                          name="is_fixed_reservation"
                          checked={formData.is_fixed_reservation}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-700 peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-focus:border-blue-500 transition-all duration-200 cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:border-gray-400">
                          {formData.is_fixed_reservation && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <Lock size={16} className="mr-1" />
                      Reserva Fixa
                    </label>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Descrição adicional da sala..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status (apenas para edição) */}
                {modalMode === "edit" && (
                  <div>
                    <label className="flex items-center">
                      <div className="relative mr-2">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-700 peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-focus:border-blue-500 transition-all duration-200 cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:border-gray-400">
                          {formData.is_active && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      Sala ativa
                    </label>
                  </div>
                )}

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {formLoading ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Rooms;
