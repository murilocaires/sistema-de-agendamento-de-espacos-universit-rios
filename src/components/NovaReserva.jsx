import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import CustomSelect from "./CustomSelect";
import { 
  getRooms,
  createReservation,
  getReservations,
  getMyProjects
} from "../services/authService";
import { 
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Monitor,
  Wifi,
  AirVent 
} from "lucide-react";
import { 
  isSameDate, 
  createBrazilDateTime, 
  isDateInPast, 
  getBrazilNow,
  formatBrazilDate,
  formatBrazilTime 
} from "../utils/dateUtils";

const NovaReserva = ({ 
  title = "Nova Reserva",
  userType = "student",
  showProjectSelection = true,
  onReservationCreated = null 
}) => {
  const { user } = useAuth();

  // Estados
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    project_id: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    people_count: "",
    is_recurring: false,
    recurrence_frequency: "daily",
    recurrence_end_date: "",
    room_resources: {
      projector: false,
      internet: false,
      air_conditioning: false
    }
  });

  const [errors, setErrors] = useState({});
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('bloco1');

  // Estados do calendário
  const [currentDate, setCurrentDate] = useState(new Date());

  // Recursos da sala
  const roomResources = [
    { key: 'projector', label: 'Projetor', icon: Monitor },
    { key: 'internet', label: 'Internet', icon: Wifi },
    { key: 'air_conditioning', label: 'Ar Condicionado', icon: AirVent }
  ];

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, reservationsData, projectsData] = await Promise.all([
        getRooms(),
        getReservations(),
        showProjectSelection ? getMyProjects() : Promise.resolve([])
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

  // Filtrar salas disponíveis baseado nos critérios selecionados
  useEffect(() => {
    filterAvailableRooms();
  }, [formData.project_id, formData.description, formData.date, formData.start_time, formData.end_time, formData.people_count, formData.room_resources, formData.is_recurring, formData.recurrence_end_date, formData.recurrence_frequency, rooms, reservations, activeTab, showProjectSelection]);

  // Função para verificar se uma sala está disponível no horário selecionado
  const isRoomAvailable = (room) => {
    if (!formData.date || !formData.start_time || !formData.end_time) return false;
    
    const hasConflict = reservations.some(reservation => {
      // Só verificar reservas aprovadas (não pendentes)
      if (reservation.status !== 'approved') return false;
      if (reservation.room_id !== room.id) return false;
      
      // Comparar datas usando timezone de Brasília
      if (!isSameDate(formData.date, reservation.date)) return false;
      
      // Verificar se há sobreposição de horários
      const reservationStart = reservation.start_time;
      const reservationEnd = reservation.end_time;
      
      // Conflito se há qualquer sobreposição de horários
      // Nova reserva: [start_time, end_time]
      // Reserva existente: [reservationStart, reservationEnd]
      // Há conflito se: start_time < reservationEnd && end_time > reservationStart
      return (formData.start_time < reservationEnd && formData.end_time > reservationStart);
    });
    
    return !hasConflict;
  };

  // Função para selecionar uma sala
  const selectRoom = (room) => {
    setSelectedRoom(room);
  };

  // Função para gerar dias recorrentes baseados no dia da semana
  const getRecurringDays = () => {
    if (!formData.is_recurring || !formData.date || !formData.recurrence_end_date) {
      return [];
    }
    

    const startDate = new Date(formData.date);
    const endDate = new Date(formData.recurrence_end_date);
    const startDayOfWeek = startDate.getDay(); // Dia da semana (0-6)
    const startDayOfMonth = startDate.getDate(); // Dia do mês (1-31)
    const recurringDays = [];

    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      if (formData.recurrence_frequency === 'daily') {
        // Para diária, adiciona todos os dias
        recurringDays.push(currentDate.toISOString().split('T')[0]);
      } else {
        // Para semanal e quinzenal, verifica o dia da semana
        if (currentDate.getDay() === startDayOfWeek) {
          recurringDays.push(currentDate.toISOString().split('T')[0]);
        }
      }
      
      // Avançar baseado na frequência
      if (formData.recurrence_frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (formData.recurrence_frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (formData.recurrence_frequency === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + 14);
      }
    }

    return recurringDays;
  };

  const filterAvailableRooms = () => {
    // Verificar se todos os campos obrigatórios estão preenchidos
    const hasProject = !showProjectSelection || formData.project_id;
    const hasDescription = formData.description.trim();
    const hasDate = formData.date;
    const hasStartTime = formData.start_time;
    const hasEndTime = formData.end_time;
    const hasParticipants = formData.people_count && formData.people_count > 0;
    
    // Se for recorrente, verificar campos adicionais
    const hasRecurrenceFields = !formData.is_recurring || 
      (formData.recurrence_frequency && formData.recurrence_end_date);
    
    // Não mostrar salas se campos obrigatórios não estão preenchidos
    if (!hasProject || !hasDescription || !hasDate || !hasStartTime || !hasEndTime || !hasParticipants || !hasRecurrenceFields) {
      setAvailableRooms([]);
      return;
    }

    const requiredResources = Object.entries(formData.room_resources)
      .filter(([key, value]) => value)
      .map(([key]) => key);

    // Filtrar por bloco
    let roomsInBlock = rooms.filter(room => {
      // Se a sala tem uma propriedade 'block', usar ela
      if (room.block) {
        return room.block === activeTab;
      }
      
      // Caso contrário, usar lógica baseada no ID (fallback)
      if (activeTab === 'bloco1') {
        return room.id <= 5; // Salas 1-5 são do Bloco 1
      } else {
        return room.id > 5; // Salas 6+ são do Bloco 2
      }
    });

    // Se não há salas no bloco selecionado, mostrar todas as salas
    if (roomsInBlock.length === 0) {
      roomsInBlock = rooms;
    }


    const roomsWithResources = roomsInBlock.filter(room => {
      if (requiredResources.length === 0) return true;
      return requiredResources.every(resource => {
        const roomHasResource = room.resources && room.resources[resource] === true;
        return roomHasResource;
      });
    });

    // Filtrar salas disponíveis no horário selecionado
    const availableRooms = roomsWithResources.filter(room => isRoomAvailable(room));
    setAvailableRooms(availableRooms);
  };

  // Funções do calendário
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Adicionar dias do mês anterior
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNumber = prevMonthDays - i;
      days.push({
        date: new Date(year, month - 1, dayNumber),
        isCurrentMonth: false
      });
    }
    
    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }
    
    // Adicionar dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const navigateCalendar = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(getBrazilNow());
  };

  // Handler específico para o campo de data
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    
    // Sempre atualizar o valor do campo, mesmo se houver erro de validação
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Permitir campo vazio
    if (value === '') {
      setErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }
    
    // Validar formato da data - só validar se estiver completo
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      // Limpar erro se ainda está digitando
      setErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }
    
    const year = value.split('-')[0];
    const month = value.split('-')[1];
    const day = value.split('-')[2];
    
    // Validar ano (4 dígitos) - só se a data estiver completa
    const yearNum = parseInt(year);
    if (year.length !== 4 || isNaN(yearNum)) {
      setErrors(prev => ({
        ...prev,
        [name]: "Ano deve ter 4 dígitos"
      }));
      return;
    }
    
    // Validar se a data é anterior à data atual (apenas para data principal)
    if (name === 'date') {
      // Usar timezone de Brasília para validação
      if (isDateInPast(value)) {
        setErrors(prev => ({
          ...prev,
          [name]: "A data não pode ser anterior à data atual"
        }));
        return;
      }
    }
    
    // Validar se a data final é anterior à data inicial (apenas para data final)
    if (name === 'recurrence_end_date' && formData.date) {
      // Usar timezone de Brasília para comparação
      const selectedDate = new Date(value);
      const startDate = new Date(formData.date);
      
      if (selectedDate < startDate) {
        setErrors(prev => ({
          ...prev,
          [name]: "A data final deve ser posterior à data inicial"
        }));
        return;
      }
    }
    
    // Se chegou até aqui, a data é válida - limpar erro
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Manipular mudanças no formulário
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Usar handler específico para campos de data
    if (name === 'date' || name === 'recurrence_end_date') {
      handleDateChange(e);
      return;
    }
    
    if (type === 'checkbox') {
      if (name === 'is_recurring') {
        setFormData(prev => ({
          ...prev,
          [name]: checked,
          recurrence_end_date: checked ? prev.recurrence_end_date : ""
        }));
      } else if (Object.keys(formData.room_resources).includes(name)) {
        setFormData(prev => ({
          ...prev,
          room_resources: {
            ...prev.room_resources,
            [name]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpar erro do campo quando o usuário começar a digitar
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

    // Verificar se a sala selecionada ainda está disponível
    if (selectedRoom && !isRoomAvailable(selectedRoom)) {
      setError("Esta sala não está mais disponível no horário selecionado. Por favor, escolha outra sala.");
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      const reservationData = {
        title: showProjectSelection ? `Reserva - ${getSelectedProjectName()}` : "Reserva",
        description: formData.description,
        project_id: showProjectSelection ? parseInt(formData.project_id) : null,
        room_id: selectedRoom.id,
        start_time: `${formData.date}T${formData.start_time}`,
        end_time: `${formData.date}T${formData.end_time}`,
        people_count: formData.people_count,
        recurrence_type: formData.is_recurring ? formData.recurrence_frequency : "none",
        recurrence_end_date: formData.is_recurring ? formData.recurrence_end_date : null,
        recurrence_interval: 1,
        room_resources: formData.room_resources
      };

      const result = await createReservation(reservationData);
      
      setCreatedReservation(result);
      setShowModal(true);
      
      await loadData();
      resetForm();

      // Callback para componente pai
      if (onReservationCreated) {
        onReservationCreated(result);
      }

    } catch (err) {
      setError("Erro ao criar reserva: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      project_id: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
      people_count: "",
      is_recurring: false,
      recurrence_frequency: "daily",
      recurrence_end_date: "",
      room_resources: {
        projector: false,
        internet: false,
        air_conditioning: false
      }
    });
    setSelectedRoom(null);
    setErrors({});
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors = {};

    if (showProjectSelection && !formData.project_id) {
      newErrors.project_id = "Selecione um projeto";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.date) {
      newErrors.date = "Data é obrigatória";
    } else {
      // Validar se a data é anterior à data atual usando timezone de Brasília
      if (isDateInPast(formData.date)) {
        newErrors.date = "A data não pode ser anterior à data atual";
      }
      
      // Validar se o ano tem exatamente 4 dígitos
      const year = formData.date.split('-')[0];
      if (year && (year.length !== 4 || isNaN(parseInt(year)))) {
        newErrors.date = "Ano deve ter 4 dígitos";
      }
    }

    if (!formData.start_time) {
      newErrors.start_time = "Horário de início é obrigatório";
    }

    if (!formData.end_time) {
      newErrors.end_time = "Horário de fim é obrigatório";
    }

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = "Horário de fim deve ser posterior ao início";
    }

    if (!formData.people_count || formData.people_count === "" || formData.people_count <= 0) {
      newErrors.people_count = "Quantidade de participantes deve ser maior que 0";
    }

    if (!selectedRoom) {
      newErrors.room = "Selecione uma sala";
    }

    if (formData.is_recurring && !formData.recurrence_end_date) {
      newErrors.recurrence_end_date = "Data de fim da recorrência é obrigatória";
    }

    if (formData.is_recurring && !formData.recurrence_frequency) {
      newErrors.recurrence_frequency = "Frequência é obrigatória para reservas recorrentes";
    }

    if (formData.is_recurring && formData.recurrence_end_date && formData.recurrence_end_date <= formData.date) {
      newErrors.recurrence_end_date = "Data de fim deve ser posterior à data inicial";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Obter nome do projeto selecionado
  const getSelectedProjectName = () => {
    const project = myProjects.find(p => p.id === parseInt(formData.project_id));
    return project ? project.name : "";
  };

  // Convert projects array to options format for CustomSelect
  const getProjectOptions = (projects) => {
    return [
      { value: '', label: 'Selecione um projeto' },
      ...projects.map(project => ({
        value: String(project.id),
        label: project.name
      }))
    ];
  };

  // --- Compact DatePicker (inline) ---
  const DatePicker = ({ value, onChange, error, min, max }) => {
    const [open, setOpen] = useState(false);
    const [viewDate, setViewDate] = useState(currentDate);
    const ref = useRef(null);

    useEffect(() => {
      const handleOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleOutside);
      return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    useEffect(() => {
      // keep viewDate in sync with global currentDate when opened
      if (open) setViewDate(currentDate);
    }, [open]);

    const days = getDaysInMonth(viewDate);

    const prevMonth = () => setViewDate(d => { const nd = new Date(d); nd.setMonth(d.getMonth() - 1); return nd; });
    const nextMonth = () => setViewDate(d => { const nd = new Date(d); nd.setMonth(d.getMonth() + 1); return nd; });

    return (
      <div className="relative w-[100%] md:w-36" ref={ref}>
        {/* Hide native browser datepicker icon so only our styled icon remains */}
        <style>{`
          .no-calendar { appearance: none; -moz-appearance: textfield; }
          .no-calendar::-webkit-calendar-picker-indicator { display: none; -webkit-appearance: none; }
          .no-calendar::-webkit-inner-spin-button, .no-calendar::-webkit-clear-button { display: none; }
          .no-calendar::-ms-clear { display: none; }
        `}</style>
        <div className={`relative flex items-center border rounded ${error ? 'border-red-500' : 'border-[#E3E5E8]'} bg-white w-full`}>
          <input
            type="date"
            name="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onClick={() => setOpen(v => !v)}
            placeholder="Selecione a data"
            min={min}
            max={max}
            className="no-calendar w-full py-2 px-3 pr-10 text-sm bg-transparent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label="Abrir calendário"
          >
            <Calendar size={18} />
          </button>
        </div>

        {open && (
          <div className="absolute left-0 mt-2 z-50 w-[290px] max-h-64 overflow-auto bg-white border border-[#E3E5E8] rounded shadow-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-800">
                {viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </div>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 focus:outline-none"><ChevronLeft size={14} /></button>
                <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 focus:outline-none"><ChevronRight size={14} /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-2">
              {['D','S','T','Q','Q','S','S'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const dayString = day.date.toISOString().split('T')[0];
                const isSelected = value && value === dayString;
                const disabled = isDateInPast(dayString);
                return (
                  <button
                    key={idx}
                    onClick={() => { if (!disabled) { onChange(dayString); setOpen(false); } }}
                    disabled={disabled}
                    className={`text-center p-1 rounded text-xs font-medium focus:outline-none ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-900'} ${isSelected ? 'bg-blue-600 text-white' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- TimePicker (native) ---
  // Keep native typing (HH:MM) and only style the visible input container (border on all sides)
  const TimePicker = ({ name, value, onChange, error }) => {
    const inputRef = useRef(null);

    const openNativePicker = () => {
      const el = inputRef.current;
      if (!el) return;
      // try the modern showPicker() if available
      if (typeof el.showPicker === 'function') {
        try { el.showPicker(); return; } catch (e) { /* ignore */ }
      }
      // fallback: focus the input so browser may show its native UI
      el.focus();
    };

    return (
      <div className="relative w-full md:w-24">
        <div className={`flex items-center border rounded ${error ? 'border-red-500' : 'border-[#E3E5E8]'} bg-white w-full`}>
          <input
            ref={inputRef}
            type="time"
            name={name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="no-calendar w-full py-2 px-3 pr-10 text-sm bg-transparent focus:outline-none"
          />
          <button
            type="button"
            onClick={openNativePicker}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label="Abrir seletor de horário"
          >
            <Clock size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* global component-scoped CSS to hide native date/time picker icons */}
      <style>{`
        .no-calendar { appearance: none; -moz-appearance: textfield; }
        .no-calendar::-webkit-calendar-picker-indicator { display: none; -webkit-appearance: none; }
        .no-calendar::-webkit-inner-spin-button, .no-calendar::-webkit-clear-button { display: none; }
        .no-calendar::-ms-clear { display: none; }
      `}</style>
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="font-bold"
            style={{
              fontFamily: "Lato, sans-serif",
              fontSize: "24px",
              lineHeight: "140%",
              letterSpacing: "0%",
              color: "#2E3DA3",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        
  {/* Layout Principal - Formulário e Painel lateral (stacked on mobile) */}
  <div className="flex flex-col md:flex-row gap-6">
          {/* Formulário de Criação */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border p-6">
            <form id="reservation-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Projeto - Só mostra se showProjectSelection for true */}
              {showProjectSelection && (
                <div>
                  <label 
                    className="block mb-2"
                    style={{
                      fontFamily: "Lato, sans-serif",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#535964",
                    }}
                  >
                    PROJETO
                  </label>
                  <CustomSelect
                    value={formData.project_id}
                    onChange={(val) => setFormData(prev => ({ ...prev, project_id: val }))}
                    options={getProjectOptions(myProjects)}
                    placeholder="Selecione um projeto"
                    error={errors.project_id}
                    label="PROJETO"
                    className="md:w-120"
                  />
                  {errors.project_id && <p className="mt-1 text-sm text-red-600">{errors.project_id}</p>}
                </div>
              )}

              {/* Descrição */}
              <div>
                <label 
                  className="block mb-2"
                  style={{
                    fontFamily: "Lato, sans-serif",
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#535964",
                  }}
                >
                  DESCRIÇÃO
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full py-2 border-0 border-b focus:outline-none focus:border-blue-500 resize-none ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  style={{
                    borderBottomColor: errors.description ? "#ef4444" : "#E3E5E8"
                  }}
                  placeholder="Descreva o propósito da reserva..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Data, Horários e Participantes */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                <div className="flex-1">
                  <label 
                    className="block mb-2"
                    style={{
                      fontFamily: "Lato, sans-serif",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#535964",
                    }}
                  >
                    DATA
                  </label>
                  <DatePicker
                    value={formData.date}
                    onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
                    error={errors.date}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                </div>
                <div className="w-full md:w-20">
                  <label 
                    className="block mb-2"
                    style={{
                      fontFamily: "Lato, sans-serif",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#535964",
                    }}
                  >
                    INÍCIO
                  </label>
                  <TimePicker
                    name="start_time"
                    value={formData.start_time}
                    onChange={(val) => setFormData(prev => ({ ...prev, start_time: val }))}
                    error={errors.start_time}
                  />
                  {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
                </div>
                <div className="w-full md:w-20">
                  <label 
                    className="block mb-2"
                    style={{
                      fontFamily: "Lato, sans-serif",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#535964",
                    }}
                  >
                    FIM
                  </label>
                  <TimePicker
                    name="end_time"
                    value={formData.end_time}
                    onChange={(val) => setFormData(prev => ({ ...prev, end_time: val }))}
                    error={errors.end_time}
                  />
                  {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
                </div>
                <div className="w-full md:w-16">
                  <label 
                    className="block mb-2"
                    style={{
                      fontFamily: "Lato, sans-serif",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#535964",
                    }}
                  >
                    PARTICIPANTES
                  </label>
                  <input
                    type="number"
                    name="people_count"
                    value={formData.people_count}
                    onChange={handleInputChange}
                    min="1"
                    max="999"
                    maxLength="3"
                    placeholder="0"
                    className={`w-full py-2 border-0 border-b focus:outline-none focus:border-blue-500 ${
                      errors.people_count ? "border-red-500" : ""
                    }`}
                    style={{
                      borderBottomColor: errors.people_count ? "#ef4444" : "#E3E5E8"
                    }}
                  />
                  {errors.people_count && <p className="mt-1 text-sm text-red-600">{errors.people_count}</p>}
                </div>
              </div>

              {/* Recursos */}
              <div>
                <label 
                  className="block mb-2"
                  style={{
                    fontFamily: "Lato, sans-serif",
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#535964",
                  }}
                >
                  RECURSOS
                </label>
                <div className="flex flex-wrap gap-4">
                  {roomResources.map(resource => {
                    const IconComponent = resource.icon;
                    return (
                      <label key={resource.key} className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          name={resource.key}
                          checked={formData.room_resources[resource.key]}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <IconComponent size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-700">{resource.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Recorrência */}
              <div>
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <span 
                      className="text-sm font-medium"
                      style={{
                        fontFamily: "Lato, sans-serif",
                        fontSize: "10px",
                        fontWeight: "bold",
                        color: "#535964",
                      }}
                    >
                      RECORRENTE
                    </span>
                    <input
                      type="checkbox"
                      name="is_recurring"
                      checked={formData.is_recurring}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>

                {formData.is_recurring && (
                  <div className="mt-6 flex flex-col md:flex-row md:gap-8 space-y-4 md:space-y-0">
                    <div className="w-full md:w-32">
                      <label 
                        className="block mb-2"
                        style={{
                          fontFamily: "Lato, sans-serif",
                          fontSize: "10px",
                          fontWeight: "bold",
                          color: "#535964",
                        }}
                      >
                        FREQUÊNCIA
                      </label>
                      <CustomSelect
                        value={formData.recurrence_frequency}
                        onChange={(value) => handleInputChange({ 
                          target: { 
                            name: 'recurrence_frequency', 
                            value 
                          }
                        })}
                        options={[
                          { value: 'daily', label: 'Diária' },
                          { value: 'weekly', label: 'Semanal' },
                          { value: 'biweekly', label: 'Quinzenal' }
                        ]}
                        placeholder="Selecione a frequência"
                        error={errors.recurrence_frequency}
                      />
                    </div>
                    <div className="w-full md:w-36">
                      <label 
                        className="block mb-2"
                        style={{
                          fontFamily: "Lato, sans-serif",
                          fontSize: "10px",
                          fontWeight: "bold",
                          color: "#535964",
                        }}
                      >
                        DATA FINAL
                      </label>
                      <DatePicker
                        value={formData.recurrence_end_date}
                        onChange={(val) => setFormData(prev => ({ ...prev, recurrence_end_date: val }))}
                        error={errors.recurrence_end_date}
                        min={formData.date}
                        max="2099-12-31"
                      />
                      {errors.recurrence_end_date && <p className="mt-1 text-sm text-red-600">{errors.recurrence_end_date}</p>}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Painel lateral (Salas e Ações) */}
          <div className="md:w-80 w-full space-y-4 mt-6 md:mt-0">
            {/* Calendário (apenas em telas md+) */}
            <div className="hidden md:block">
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    {currentDate.toLocaleDateString('pt-BR', { 
                      month: 'long', 
                      year: 'numeric',
                      timeZone: 'America/Sao_Paulo'
                    })}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigateCalendar(-1)}
                      className="p-1 rounded focus:outline-none transition-transform hover:scale-105"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => navigateCalendar(1)}
                      className="p-1 rounded focus:outline-none transition-transform hover:scale-105"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-gray-500 p-1 font-medium text-xs">
                      {day}
                    </div>
                  ))}
                
                {getDaysInMonth(currentDate).map((day, index) => {
                  const isToday = isSameDate(day.date, getBrazilNow());
                  const dayString = day.date.toISOString().split('T')[0];
                  const isSelected = formData.date && dayString === formData.date;
                  const recurringDays = getRecurringDays();
                  const isRecurring = recurringDays.includes(dayString);

                  let recurringStyle = '';
                  if (isRecurring && !isSelected && formData.is_recurring && formData.recurrence_frequency === 'daily') {
                    const isFirstDay = dayString === formData.date;
                    const isLastDay = dayString === formData.recurrence_end_date;
                    const isMiddleDay = !isFirstDay && !isLastDay;
                    if (isFirstDay || isLastDay) {
                      recurringStyle = 'bg-blue-600 text-white hover:bg-blue-600';
                    } else if (isMiddleDay) {
                      recurringStyle = 'bg-blue-100 text-blue-700 hover:bg-blue-200';
                    }
                  } else if (isRecurring && !isSelected) {
                    recurringStyle = 'bg-blue-600 text-white hover:bg-blue-600';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => setFormData(prev => ({ ...prev, date: dayString }))}
                      className={`text-center p-1 rounded text-xs font-medium focus:outline-none ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'} ${isToday ? 'border-2 border-blue-600' : ''} ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-600' : ''} ${recurringStyle} ${!isSelected && !isRecurring && day.isCurrentMonth ? 'hover:bg-blue-100' : ''}`}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
                </div>
              </div>
            </div>

            {/* Salas Disponíveis */}
            {availableRooms.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-medium text-gray-900 mb-4">Salas Disponíveis</h3>
                
                {/* Abas dos Blocos */}
                <div className="flex mb-4 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('bloco1')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
                      activeTab === 'bloco1' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Bloco 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bloco2')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
                      activeTab === 'bloco2' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Bloco 2
                  </button>
                </div>

                {/* Grid de Salas */}
                {availableRooms.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {availableRooms.slice(0, 3).map(room => (
                        <div
                          key={room.id}
                          className={`px-1 py-2 rounded-lg text-center text-[10px] font-medium cursor-pointer transition-colors flex items-center justify-center min-h-[40px] max-h-[40px] overflow-hidden focus:outline-none ${
                            selectedRoom?.id === room.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                          onClick={() => selectRoom(room)}
                          tabIndex={0}
                        >
                          <span className="break-words leading-tight text-center w-full">{room.name}</span>
                        </div>
                      ))}
                    </div>
                    {availableRooms.length > 3 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {availableRooms.slice(3, 5).map(room => (
                          <div
                            key={room.id}
                            className={`px-1 py-2 rounded-lg text-center text-[10px] font-medium cursor-pointer transition-colors flex items-center justify-center min-h-[40px] max-h-[40px] overflow-hidden focus:outline-none ${
                              selectedRoom?.id === room.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                            onClick={() => selectRoom(room)}
                            tabIndex={0}
                          >
                            <span className="break-words leading-tight text-center w-full">{room.name}</span>
                          </div>
                        ))}
                        {availableRooms.length === 4 && <div></div>}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Nenhuma sala disponível neste bloco
                  </p>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Preencha todos os campos obrigatórios</h3>
                  <p className="text-sm text-gray-500">
                    Para ver as salas disponíveis, preencha: {showProjectSelection && "projeto, "}descrição, data, horários e quantidade de participantes.
                    {formData.is_recurring && " Se for recorrente, também selecione a frequência e data final."}
                  </p>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <button
                type="submit"
                form="reservation-form"
                disabled={formLoading || !selectedRoom}
                className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none"
              >
                {formLoading ? "Solicitando..." : "Solicitar"}
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Sucesso */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
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
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NovaReserva;
