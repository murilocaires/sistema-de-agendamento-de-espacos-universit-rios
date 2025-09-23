import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  getRooms,
  createReservation,
  getReservations,
  getMyProjects
} from "../../services/authService";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  DoorClosed,
  CheckCircle,
  AlertCircle,
  X,
  CalendarPlus,
  Save,
  RotateCcw,
  Repeat,
  Search,
  HelpCircle
} from "lucide-react";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../components/Calendar.css';
import StudentLayout from "../../layouts/StudentLayout";

// Configurar localização para português
moment.locale('pt-br', {
  weekdays: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  weekdaysMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
});
const localizer = momentLocalizer(moment);

const NovaReservaAluno = () => {
  const { user } = useAuth();

  // Estados
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_id: "",
    room_id: "",
    start_time: "",
    end_time: "",
    people_count: 1,
    recurrence_type: "none",
    recurrence_end_date: "",
    recurrence_interval: 1
  });

  // Estados de validação
  const [errors, setErrors] = useState({});

  // Estados do calendário
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Estados para busca de salas
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState([]);

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, reservationsData, projectsData] = await Promise.all([
        getRooms(),
        getReservations(),
        getMyProjects()
      ]);
      
      setRooms(roomsData.filter(room => room.is_active));
      setReservations(reservationsData);
      setMyProjects(projectsData);
      setError("");
    } catch (err) {
      setError("Erro ao carregar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrar salas baseado no termo de busca
  useEffect(() => {
    if (roomSearchTerm.trim() === "") {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter(room =>
        room.name.toLowerCase().includes(roomSearchTerm.toLowerCase())
      );
      setFilteredRooms(filtered);
    }
  }, [roomSearchTerm, rooms]);

  // Carregar eventos do calendário quando uma sala é selecionada
  useEffect(() => {
    if (selectedRoom) {
      loadCalendarEvents();
    }
  }, [selectedRoom, reservations]);

  // Carregar eventos do calendário para a sala selecionada
  const loadCalendarEvents = () => {
    if (!selectedRoom) return;

    const roomReservations = reservations.filter(reservation => 
      reservation.room_id === selectedRoom.id
    );

    const events = roomReservations.map(reservation => ({
      id: reservation.id,
      title: reservation.title,
      start: new Date(reservation.start_time),
      end: new Date(reservation.end_time),
      resource: {
        status: reservation.status,
        user: reservation.user_name,
        room: reservation.room_name
      }
    }));

    setCalendarEvents(events);
  };

  // Manipular seleção de sala
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setRoomSearchTerm(room.name);
    setShowRoomDropdown(false);
    setFormData(prev => ({
      ...prev,
      room_id: room.id
    }));
    
    // Limpar erro da sala
    if (errors.room_id) {
      setErrors(prev => ({
        ...prev,
        room_id: ""
      }));
    }
  };

  // Manipular mudança no campo de busca de sala
  const handleRoomSearchChange = (e) => {
    const value = e.target.value;
    setRoomSearchTerm(value);
    setShowRoomDropdown(true);
    
    // Se o campo estiver vazio, limpar seleção
    if (value.trim() === "") {
      setSelectedRoom(null);
      setFormData(prev => ({
        ...prev,
        room_id: ""
      }));
    }
  };

  // Fechar dropdown quando clicar fora
  const handleClickOutside = (e) => {
    if (!e.target.closest('.room-search-container')) {
      setShowRoomDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Validar formulário
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!formData.project_id) {
      newErrors.project_id = "Projeto é obrigatório";
    }

    if (!formData.room_id) {
      newErrors.room_id = "Sala é obrigatória";
    }

    if (!formData.start_time) {
      newErrors.start_time = "Data/hora de início é obrigatória";
    }

    if (!formData.end_time) {
      newErrors.end_time = "Data/hora de fim é obrigatória";
    }

    if (!formData.people_count || formData.people_count < 1) {
      newErrors.people_count = "Quantidade de pessoas deve ser pelo menos 1";
    }

    // Verificar se a quantidade de pessoas não excede a capacidade da sala
    if (formData.people_count && selectedRoom && formData.people_count > selectedRoom.capacity) {
      newErrors.people_count = `A quantidade de pessoas (${formData.people_count}) excede a capacidade da sala (${selectedRoom.capacity} pessoas)`;
    }

    if (formData.start_time && formData.end_time) {
      const startDate = new Date(formData.start_time);
      const endDate = new Date(formData.end_time);
      
      if (endDate <= startDate) {
        newErrors.end_time = "Data/hora de fim deve ser posterior ao início";
      }

      // Verificar se não é no passado
      const now = new Date();
      if (startDate < now) {
        newErrors.start_time = "Não é possível fazer reservas no passado";
      }
    }

    if (formData.recurrence_type !== "none" && !formData.recurrence_end_date) {
      newErrors.recurrence_end_date = "Data de fim da recorrência é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manipular mudanças no formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Manipular mudanças na sala
  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    setFormData(prev => ({
      ...prev,
      room_id: roomId
    }));

    if (errors.room_id) {
      setErrors(prev => ({
        ...prev,
        room_id: ""
      }));
    }
  };

  // Manipular mudanças na recorrência
  const handleRecurrenceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setFormLoading(true);
      setError("");
      setSuccessMessage("");

      // Preparar dados da reserva
      const reservationData = {
        title: formData.title,
        description: formData.description,
        project_id: parseInt(formData.project_id),
        room_id: parseInt(formData.room_id),
        start_time: formData.start_time,
        end_time: formData.end_time,
        people_count: parseInt(formData.people_count),
        recurrence_type: formData.recurrence_type,
        recurrence_end_date: formData.recurrence_type !== "none" ? formData.recurrence_end_date : null,
        recurrence_interval: formData.recurrence_type !== "none" ? parseInt(formData.recurrence_interval) : null
      };

      const result = await createReservation(reservationData);
      
      setCreatedReservation(result);
      setShowModal(true);
      setSuccessMessage("Reserva criada com sucesso!");
      
      // Recarregar dados para atualizar o calendário
      await loadData();
      
      // Limpar formulário
      setFormData({
        title: "",
        description: "",
        project_id: "",
        room_id: "",
        start_time: "",
        end_time: "",
        date: "",
        recurrence_type: "none",
        recurrence_end_date: "",
        recurrence_interval: 1
      });
      setSelectedRoom(null);
      setRoomSearchTerm("");
      setShowRoomDropdown(false);

    } catch (err) {
      setError("Erro ao criar reserva: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Manipular seleção de data no calendário
  const handleSelectSlot = ({ start, end }) => {
    const startTime = moment(start).format('YYYY-MM-DDTHH:mm');
    const endTime = moment(end).format('YYYY-MM-DDTHH:mm');
    
    setFormData(prev => ({
      ...prev,
      start_time: startTime,
      end_time: endTime
    }));

    // Limpar erros de data
    if (errors.start_time || errors.end_time) {
      setErrors(prev => ({
        ...prev,
        start_time: "",
        end_time: ""
      }));
    }
  };

  // Obter cor do evento baseado no status
  const getEventStyle = (event) => {
    const status = event.resource?.status;
    switch (status) {
      case 'approved':
        return { backgroundColor: '#10B981', color: 'white' };
      case 'pending':
        return { backgroundColor: '#F59E0B', color: 'white' };
      case 'rejected':
        return { backgroundColor: '#EF4444', color: 'white' };
      default:
        return { backgroundColor: '#6B7280', color: 'white' };
    }
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setCreatedReservation(null);
    setSuccess(false);
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      project_id: "",
      room_id: "",
      start_time: "",
      end_time: "",
      people_count: 1,
      date: "",
      recurrence_type: "none",
      recurrence_end_date: "",
      recurrence_interval: 1
    });
    setSelectedRoom(null);
    setRoomSearchTerm("");
    setShowRoomDropdown(false);
    setErrors({});
    setError("");
  };

  // Obter nome da sala selecionada
  const getSelectedRoomName = () => {
    const room = rooms.find(r => r.id === parseInt(formData.room_id));
    return room ? room.name : "";
  };

  // Obter nome do projeto selecionado
  const getSelectedProjectName = () => {
    const project = myProjects.find(p => p.id === parseInt(formData.project_id));
    return project ? project.name : "";
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CalendarPlus className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">
              Nova Reserva
            </h1>
          </div>
          <p className="text-gray-700">
            Crie uma nova reserva de espaço universitário
          </p>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}

        {/* Layout Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Formulário */}
          <div className="bg-white rounded-lg shadow border p-4 max-h-[calc(100vh-12rem)] overflow-y-auto form-scroll form-container">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Reserva *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: Aula de Matemática"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
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
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição opcional da reserva..."
                />
              </div>

              {/* Sala e Projeto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Busca de Sala */}
                <div className="room-search-container relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sala *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={roomSearchTerm}
                      onChange={handleRoomSearchChange}
                      onFocus={() => setShowRoomDropdown(true)}
                      placeholder="Digite o nome da sala..."
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.room_id ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  
                  {/* Dropdown de salas */}
                  {showRoomDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredRooms.length > 0 ? (
                        filteredRooms.map(room => (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => handleRoomSelect(room)}
                            className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{room.name}</p>
                                <p className="text-sm text-gray-600">{room.capacity} lugares</p>
                              </div>
                              <DoorClosed className="w-4 h-4 text-gray-400" />
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">
                          Nenhuma sala encontrada
                        </div>
                      )}
                    </div>
                  )}
                  
                  {errors.room_id && <p className="mt-1 text-sm text-red-600">{errors.room_id}</p>}
                </div>

                {/* Projeto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Projeto *
                  </label>
                  <select
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.project_id ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Selecione um projeto</option>
                    {myProjects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.type}
                      </option>
                    ))}
                  </select>
                  {errors.project_id && <p className="mt-1 text-sm text-red-600">{errors.project_id}</p>}
                  {myProjects.length === 0 && (
                    <p className="mt-1 text-sm text-yellow-600">
                      Você não está participando de nenhum projeto. Acesse a página de Projetos para solicitar participação.
                    </p>
                  )}
                </div>

                {/* Quantidade de Pessoas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade de Pessoas *
                  </label>
                  <input
                    type="number"
                    name="people_count"
                    value={formData.people_count}
                    onChange={handleInputChange}
                    min="1"
                    max={selectedRoom ? selectedRoom.capacity : 100}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.people_count ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Digite a quantidade de pessoas"
                  />
                  {errors.people_count && <p className="mt-1 text-sm text-red-600">{errors.people_count}</p>}
                  {selectedRoom && (
                    <p className="mt-1 text-sm text-gray-600">
                      Capacidade da sala: {selectedRoom.capacity} pessoas
                    </p>
                  )}
                </div>
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ""}
                  onChange={(e) => {
                    const date = e.target.value;
                    // Atualizar start_time e end_time com a nova data
                    if (formData.start_time) {
                      const [time] = formData.start_time.split('T')[1] || '';
                      setFormData(prev => ({
                        ...prev,
                        start_time: `${date}T${time || '09:00'}`
                      }));
                    }
                    if (formData.end_time) {
                      const [time] = formData.end_time.split('T')[1] || '';
                      setFormData(prev => ({
                        ...prev,
                        end_time: `${date}T${time || '10:00'}`
                      }));
                    }
                    setFormData(prev => ({ ...prev, date }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.start_time || errors.end_time ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {(errors.start_time || errors.end_time) && <p className="mt-1 text-sm text-red-600">{errors.start_time || errors.end_time}</p>}
              </div>

              {/* Horários */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de Início *
                  </label>
                  <input
                    type="time"
                    name="start_time_only"
                    value={formData.start_time ? formData.start_time.split('T')[1] || '' : ''}
                    onChange={(e) => {
                      const time = e.target.value;
                      const date = formData.date || new Date().toISOString().split('T')[0];
                      setFormData(prev => ({
                        ...prev,
                        start_time: `${date}T${time}`
                      }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.start_time ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de Fim *
                  </label>
                  <input
                    type="time"
                    name="end_time_only"
                    value={formData.end_time ? formData.end_time.split('T')[1] || '' : ''}
                    onChange={(e) => {
                      const time = e.target.value;
                      const date = formData.date || new Date().toISOString().split('T')[0];
                      setFormData(prev => ({
                        ...prev,
                        end_time: `${date}T${time}`
                      }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.end_time ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>

              {/* Recorrência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recorrência
                </label>
                <select
                  name="recurrence_type"
                  value={formData.recurrence_type}
                  onChange={handleRecurrenceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Sem recorrência</option>
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>

              {/* Configurações de Recorrência */}
              {formData.recurrence_type !== "none" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                      <span>Intervalo</span>
                      <div className="relative group">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 px-4 py-3 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-60">
                          <div className="space-y-1">
                            <div><strong>Intervalo:</strong> Define a frequência da repetição</div>
                            <div><strong>Diária:</strong> 1 = todos os dias, 2 = dia sim dia não</div>
                            <div><strong>Semanal:</strong> 1 = toda semana, 2 = a cada 2 semanas</div>
                            <div><strong>Mensal:</strong> 1 = todo mês, 2 = a cada 2 meses</div>
                          </div>
                          <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </label>
                    <input
                      type="number"
                      name="recurrence_interval"
                      value={formData.recurrence_interval}
                      onChange={handleRecurrenceChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim da Recorrência *
                    </label>
                    <input
                      type="date"
                      name="recurrence_end_date"
                      value={formData.recurrence_end_date}
                      onChange={handleRecurrenceChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.recurrence_end_date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.recurrence_end_date && <p className="mt-1 text-sm text-red-600">{errors.recurrence_end_date}</p>}
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  Limpar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Criar Reserva
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Calendário */}
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Calendário da Sala
              </h3>
              {selectedRoom ? (
                <p className="text-sm text-gray-600">
                  Visualizando reservas da <strong>{selectedRoom.name}</strong>
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Selecione uma sala para visualizar o calendário
                </p>
              )}
            </div>

            {selectedRoom && (
              <div className="h-96">
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  views={['month', 'week', 'day']}
                  defaultView="week"
                  selectable
                  onSelectSlot={handleSelectSlot}
                  eventPropGetter={getEventStyle}
                  messages={{
                    next: 'Próximo',
                    previous: 'Anterior',
                    today: 'Hoje',
                    month: 'Mês',
                    week: 'Semana',
                    day: 'Dia',
                    agenda: 'Agenda',
                    date: 'Data',
                    time: 'Hora',
                    event: 'Evento',
                    noEventsInRange: 'Nenhuma reserva neste período',
                    showMore: total => `+${total} mais`
                  }}
                />
              </div>
            )}

            {!selectedRoom && (
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Selecione uma sala para ver o calendário</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Sucesso */}
        {showModal && createdReservation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Reserva Criada!</h2>
                <p className="text-gray-700 mb-6">
                  Sua reserva foi criada com sucesso e está aguardando aprovação.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg text-left">
                  <h3 className="font-semibold text-gray-800 mb-2">Detalhes da Reserva:</h3>
                  <p><strong>Título:</strong> {createdReservation.title}</p>
                  <p><strong>Projeto:</strong> {getSelectedProjectName()}</p>
                  <p><strong>Sala:</strong> {getSelectedRoomName()}</p>
                  <p><strong>Início:</strong> {new Date(createdReservation.start_time).toLocaleString('pt-BR')}</p>
                  <p><strong>Fim:</strong> {new Date(createdReservation.end_time).toLocaleString('pt-BR')}</p>
                  <p><strong>Status:</strong> <span className="text-yellow-600 font-semibold">Pendente</span></p>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default NovaReservaAluno;
