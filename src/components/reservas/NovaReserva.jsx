import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  getRooms,
  createReservation,
  getReservations,
  getMyProjects,
  getProfessorProjects
} from "../../services/authService";
import { RefreshCw, Monitor, Wifi, AirVent } from "lucide-react";
import { 
  isSameDate, 
  isDateInPast, 
  getBrazilNow,
  createBrazilDateTimeISO
} from "../../utils/dateUtils";
import ProjectSelector from "./ProjectSelector";
import FormFields from "./FormFields";
import RecurrenceFields from "./RecurrenceFields";
import MiniCalendar from "./MiniCalendar";
import AvailableRoomsGrid from "./AvailableRoomsGrid";
import SuccessModal from "./SuccessModal";
import ErrorMessage from "./ErrorMessage";
import SuccessToast from "./SuccessToast";

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
  const [refreshing, setRefreshing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    project_id: "",
    project_text: "", // Texto digitado pelo usuário
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

  // Estados para o dropdown de projetos
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchProjectText, setSearchProjectText] = useState(""); // Texto para filtrar projetos

  const [errors, setErrors] = useState({});
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Estados do calendário
  const [currentDate, setCurrentDate] = useState(new Date());

  // Recursos da sala
  const roomResources = [
    { key: 'projector', label: 'Projetor', icon: Monitor },
    { key: 'internet', label: 'Internet', icon: Wifi },
    { key: 'air_conditioning', label: 'Ar Condicionado', icon: AirVent }
  ];

  // Função para gerar dias recorrentes baseados no dia da semana
  const getRecurringDays = () => {
    if (!formData.is_recurring || !formData.date || !formData.recurrence_end_date) {
      return [];
    }
    
    const startDate = new Date(formData.date);
    const endDate = new Date(formData.recurrence_end_date);
    const startDayOfWeek = startDate.getDay(); // Dia da semana (0-6)
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

  // Função para expandir reservas recorrentes
  const expandRecurringReservations = (reservation) => {
    if (!reservation.is_recurring || !reservation.recurrence_end_date) {
      return [reservation];
    }

    const occurrences = [];
    const startDate = new Date(reservation.start_time);
    const endDate = new Date(reservation.recurrence_end_date);
    
    // Normalizar endDate para fim do dia para comparação correta
    endDate.setHours(23, 59, 59, 999);
    
    // Extrair hora de início e fim
    const startHour = new Date(reservation.start_time).getHours();
    const startMinute = new Date(reservation.start_time).getMinutes();
    const endHour = new Date(reservation.end_time).getHours();
    const endMinute = new Date(reservation.end_time).getMinutes();

    let currentDate = new Date(startDate);
    let weekCount = 0;
    const maxWeeks = 52; // Limite de 1 ano

    while (currentDate <= endDate && weekCount < maxWeeks) {
      const occurrenceStart = new Date(currentDate);
      occurrenceStart.setHours(startHour, startMinute, 0, 0);
      
      const occurrenceEnd = new Date(currentDate);
      occurrenceEnd.setHours(endHour, endMinute, 0, 0);

      occurrences.push({
        ...reservation,
        id: `${reservation.id}_${currentDate.toISOString().split('T')[0]}`,
        date: currentDate.toISOString().split('T')[0],
        start_time: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
        end_time: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
        is_recurrence_instance: true,
        original_reservation_id: reservation.id
      });

      // Avançar uma semana
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 7);
      weekCount++;
    }

    return occurrences.length > 0 ? occurrences : [reservation];
  };

  // Carregar dados iniciais
  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Usar getProfessorProjects para professores/servidores, getMyProjects para alunos
      const getProjectsFunction = userType === 'professor' ? getProfessorProjects : getMyProjects;
      
      const [roomsData, reservationsData, projectsData] = await Promise.all([
        getRooms(),
        getReservations(),
        showProjectSelection ? getProjectsFunction() : Promise.resolve([])
      ]);
      
      // Expandir reservas recorrentes
      let expandedReservations = [];
      (reservationsData || []).forEach(reservation => {
        const occurrences = expandRecurringReservations(reservation);
        expandedReservations.push(...occurrences);
      });
      
      const activeRooms = roomsData.filter(room => room.is_active);
      setRooms(activeRooms);
      setReservations(expandedReservations);
      setMyProjects(projectsData);
      setError("");
    } catch (err) {
      setError("Erro ao carregar dados: " + err.message);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Função para atualizar dados manualmente
  const handleRefresh = async () => {
    await loadData(true);
    setSuccessMessage("Dados atualizados com sucesso!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrar projetos com base no texto de busca
  useEffect(() => {
    if (!searchProjectText.trim()) {
      setFilteredProjects(myProjects);
    } else {
      const filtered = myProjects.filter(project =>
        project.name.toLowerCase().includes(searchProjectText.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchProjectText, myProjects]);


  // Filtrar salas disponíveis baseado nos critérios selecionados
  useEffect(() => {
    filterAvailableRooms();
  }, [formData.project_text, formData.description, formData.date, formData.start_time, formData.end_time, formData.people_count, formData.room_resources, formData.is_recurring, formData.recurrence_end_date, formData.recurrence_frequency, rooms, reservations, showProjectSelection]);

  // Função para verificar se uma sala está disponível no horário selecionado
  const isRoomAvailable = (room) => {
    if (!formData.date || !formData.start_time || !formData.end_time) return false;
    
    // Se for recorrente, verificar todas as datas da recorrência
    if (formData.is_recurring && formData.recurrence_end_date) {
      const recurringDays = getRecurringDays();
      
      console.log(`📅 Verificando disponibilidade recorrente para sala ${room.name}:`, {
        totalDias: recurringDays.length,
        frequencia: formData.recurrence_frequency,
        datas: recurringDays
      });
      
      // Verificar se a sala está disponível em TODAS as datas recorrentes
      const allDaysAvailable = recurringDays.every(dateString => {
        const hasConflict = reservations.some(reservation => {
          // Só verificar reservas aprovadas (não pendentes)
          if (reservation.status !== 'approved') return false;
          if (reservation.room_id !== room.id) return false;
          
          // Comparar datas usando timezone de Brasília
          if (!isSameDate(dateString, reservation.date)) return false;
          
          // Verificar se há sobreposição de horários
          const reservationStart = reservation.start_time;
          const reservationEnd = reservation.end_time;
          
          // Conflito se há qualquer sobreposição de horários
          return (formData.start_time < reservationEnd && formData.end_time > reservationStart);
        });
        
        if (hasConflict) {
          console.log(`❌ Sala ${room.name} indisponível em ${dateString}`);
        }
        
        return !hasConflict;
      });
      
      if (allDaysAvailable) {
        console.log(`✅ Sala ${room.name} disponível em todas as ${recurringDays.length} datas`);
      }
      
      return allDaysAvailable;
    }
    
    // Para reservas não recorrentes, verificar apenas a data selecionada
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

  // Função para navegar no calendário
  const navigateCalendar = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Função para selecionar data no calendário
  const handleDateSelect = (dayString) => {
    setFormData(prev => ({ ...prev, date: dayString }));
  };

  const filterAvailableRooms = () => {
    // Verificar se todos os campos obrigatórios estão preenchidos
    const hasProject = !showProjectSelection || (formData.project_id && formData.project_text.trim());
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

    // Filtrar salas baseado em reservas recorrentes
    let roomsFiltered = rooms;
    
    // Se for recorrente, filtrar apenas salas que NÃO são de reserva fixa
    if (formData.is_recurring) {
      console.log('🔍 Filtrando salas para reserva recorrente...');
      console.log('Salas antes do filtro de recorrência:', roomsFiltered.map(r => ({
        name: r.name,
        is_fixed_reservation: r.is_fixed_reservation,
        tipo: typeof r.is_fixed_reservation
      })));
      
      roomsFiltered = roomsFiltered.filter(room => {
        // is_fixed_reservation = true significa que a sala é APENAS para reservas fixas
        // Então, para reservas recorrentes avulsas, queremos salas onde is_fixed_reservation = false ou null
        // Tratar valores booleanos, numéricos e null/undefined
        const isFixed = room.is_fixed_reservation === true || room.is_fixed_reservation === 1;
        const allowsRecurring = !isFixed;
        
        console.log(`🏢 Sala ${room.name}:`, {
          is_fixed_reservation: room.is_fixed_reservation,
          tipo: typeof room.is_fixed_reservation,
          isFixed: isFixed,
          allowsRecurring: allowsRecurring
        });
        
        return allowsRecurring;
      });
      
      console.log('✅ Salas após filtro de recorrência:', roomsFiltered.map(r => r.name));
    }
    
    const roomsWithResources = roomsFiltered.filter(room => {
      if (requiredResources.length === 0) return true;
      return requiredResources.every(resource => {
        // Mapear nomes dos recursos para os campos do banco de dados
        const dbFieldMap = {
          'projector': 'has_projector',
          'internet': 'has_internet',
          'air_conditioning': 'has_air_conditioning'
        };
        
        const dbField = dbFieldMap[resource];
        
        // Verificar tanto em room.resources quanto diretamente na room
        const roomHasResource = 
          (room.resources && room.resources[resource] === true) || 
          (room[dbField] === true) ||
          (room[dbField] === 1);
        
        return roomHasResource;
      });
    });

    // Filtrar salas disponíveis no horário selecionado
    const availableRooms = roomsWithResources.filter(room => isRoomAvailable(room));
    setAvailableRooms(availableRooms);
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
          [name]: "A data não pode ser anterior a hoje"
        }));
      } else {
        // Limpar erro se a data for válida
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
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
      } else {
        // Limpar erro se a data for válida
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
    
    // Limpar erros de validação se o campo foi preenchido corretamente
    if (!errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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
      
      // Validar horário em tempo real se a data for hoje
      if (name === 'start_time' && formData.date && value) {
        const selectedDate = new Date(formData.date + 'T00:00:00');
        const now = getBrazilNow();
        const isToday = isSameDate(selectedDate, now);
        
        console.log('🕐 Validação de horário:', {
          data_selecionada: formData.date,
          selectedDate: selectedDate.toISOString(),
          now: now.toISOString(),
          isToday,
          horario_digitado: value
        });
        
        if (isToday) {
          const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          if (value <= currentTime) {
            setErrors(prev => ({
              ...prev,
              start_time: "O horário deve ser posterior ao horário atual"
            }));
            return;
          }
        }
        
        // Se o horário de fim já foi definido, validar se ainda é válido
        if (formData.end_time && value >= formData.end_time) {
          setErrors(prev => ({
            ...prev,
            end_time: "O horário de fim deve ser posterior ao horário de início"
          }));
        } else if (formData.end_time) {
          // Limpar erro do end_time se agora está válido
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.end_time;
            return newErrors;
          });
        }
      }
      
      // Validar horário de fim em tempo real
      if (name === 'end_time' && formData.start_time && value) {
        if (value <= formData.start_time) {
          setErrors(prev => ({
            ...prev,
            end_time: "O horário de fim deve ser posterior ao horário de início"
          }));
          return;
        }
      }
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

      // O título sempre será o nome do projeto selecionado (validado antes)
      const selectedProject = myProjects.find(p => p.id === formData.project_id);

      // Criar datas ISO considerando o horário como sendo de Brasília
      const startTimeISO = createBrazilDateTimeISO(formData.date, formData.start_time);
      const endTimeISO = createBrazilDateTimeISO(formData.date, formData.end_time);
      const recurrenceEndDateISO = formData.is_recurring && formData.recurrence_end_date 
        ? createBrazilDateTimeISO(formData.recurrence_end_date, "23:59")
        : null;

      const reservationData = {
        title: showProjectSelection && selectedProject ? selectedProject.name : "Reserva",
        description: formData.description,
        project_id: showProjectSelection && formData.project_id ? parseInt(formData.project_id) : null,
        room_id: selectedRoom.id,
        start_time: startTimeISO,
        end_time: endTimeISO,
        people_count: formData.people_count,
        recurrence_type: formData.is_recurring ? formData.recurrence_frequency : "none",
        recurrence_end_date: recurrenceEndDateISO,
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
      project_text: "",
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
    setSearchProjectText(""); // Limpar busca ao resetar
    setSelectedRoom(null);
    setErrors({});
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors = {};

    if (showProjectSelection && (!formData.project_id || !formData.project_text.trim())) {
      newErrors.project_text = "Selecione um projeto da lista";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.date) {
      newErrors.date = "Data é obrigatória";
    } else {
      // Validar se a data é anterior à data atual usando timezone de Brasília
      if (isDateInPast(formData.date)) {
        newErrors.date = "A data não pode ser anterior a hoje";
      }
      
      // Validar se o ano tem exatamente 4 dígitos
      const year = formData.date.split('-')[0];
      if (year && (year.length !== 4 || isNaN(parseInt(year)))) {
        newErrors.date = "Ano deve ter 4 dígitos";
      }
    }

    if (!formData.start_time) {
      newErrors.start_time = "Horário de início é obrigatório";
    } else if (formData.date) {
      // Se a data for hoje, verificar se o horário é futuro
      const selectedDate = new Date(formData.date + 'T00:00:00');
      const now = getBrazilNow();
      const isToday = isSameDate(selectedDate, now);
      
      console.log('🕐 Validação final de horário:', {
        data_selecionada: formData.date,
        selectedDate: selectedDate.toISOString(),
        now: now.toISOString(),
        isToday,
        horario: formData.start_time
      });
      
      if (isToday) {
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (formData.start_time <= currentTime) {
          newErrors.start_time = "O horário deve ser posterior ao horário atual";
        }
      }
    }

    if (!formData.end_time) {
      newErrors.end_time = "Horário de fim é obrigatório";
    } else if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = "O horário de fim deve ser posterior ao horário de início";
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

  // Handler para mudanças no campo de projeto
  // Handler para buscar/filtrar projetos no dropdown
  const handleProjectSearchChange = (e) => {
    const value = e.target.value;
    setSearchProjectText(value);
    setShowProjectDropdown(true);
  };

  // Handler para selecionar um projeto do dropdown
  const selectProject = (project) => {
    setFormData(prev => ({
      ...prev,
      project_text: project.name,
      project_id: project.id
    }));
    setSearchProjectText(""); // Limpar busca
    setShowProjectDropdown(false);
  };

  // Handler para abrir o dropdown ao focar no campo
  const handleProjectFieldFocus = () => {
    if (!formData.project_id) {
      // Se não há projeto selecionado, mostrar todos
      setSearchProjectText("");
      setFilteredProjects(myProjects);
    }
    setShowProjectDropdown(true);
  };

  // Handler para limpar seleção
  const handleClearProject = (e) => {
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      project_text: "",
      project_id: ""
    }));
    setSearchProjectText("");
    setShowProjectDropdown(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-[152px]">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1
            className="font-bold text-lg md:text-2xl"
            style={{
              fontFamily: "Lato, sans-serif",
              lineHeight: "140%",
              letterSpacing: "0%",
              color: "#2E3DA3",
            }}
          >
            {title}
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Atualizar disponibilidade de salas"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Atualizando..." : "Atualizar"}
          </button>
        </div>

        <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
        <ErrorMessage error={error} />

        
        {/* Layout Principal - Formulário e Calendário */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Formulário de Criação */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border p-4 md:p-6">
            <form id="reservation-form" onSubmit={handleSubmit} className="space-y-4">
              <ProjectSelector
                showProjectSelection={showProjectSelection}
                formData={formData}
                errors={errors}
                searchProjectText={searchProjectText}
                showProjectDropdown={showProjectDropdown}
                filteredProjects={filteredProjects}
                onProjectSearchChange={handleProjectSearchChange}
                onProjectFieldFocus={handleProjectFieldFocus}
                onSelectProject={selectProject}
                onClearProject={handleClearProject}
                onToggleDropdown={setShowProjectDropdown}
              />
              
              <FormFields
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                roomResources={roomResources}
              />

              <RecurrenceFields
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
              />
            </form>
          </div>

          {/* Coluna Direita - Calendário e Salas */}
          <div className="w-full md:w-80 space-y-4">
            <MiniCalendar
              currentDate={currentDate}
              formData={formData}
              onNavigateCalendar={navigateCalendar}
              onDateSelect={handleDateSelect}
              getRecurringDays={getRecurringDays}
            />

            <AvailableRoomsGrid
              availableRooms={availableRooms}
              selectedRoom={selectedRoom}
              onSelectRoom={selectRoom}
              formData={formData}
              showProjectSelection={showProjectSelection}
            />

            {/* Botões */}
            <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
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

        <SuccessModal show={showModal} onClose={() => setShowModal(false)} />
      </div>
    </div>
  );
};

export default NovaReserva;
