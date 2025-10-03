// Utilitários para manipulação de datas com timezone de Brasília
const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Converte uma data para o timezone de Brasília
 * @param {Date|string} date - Data a ser convertida
 * @returns {Date} Data no timezone de Brasília
 */
export const toBrazilTime = (date) => {
  const dateObj = new Date(date);
  return new Date(dateObj.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
};

/**
 * Obtém a data atual no timezone de Brasília
 * @returns {Date} Data atual em Brasília
 */
export const getBrazilNow = () => {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
  return brazilTime;
};

/**
 * Formata uma data para o padrão brasileiro (dd/mm/yyyy)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export const formatBrazilDate = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('pt-BR', { 
    timeZone: BRAZIL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formata um horário para o padrão brasileiro (hh:mm)
 * @param {Date|string} date - Data/horário a ser formatado
 * @returns {string} Horário formatado
 */
export const formatBrazilTime = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString('pt-BR', { 
    timeZone: BRAZIL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formata data e hora para o padrão brasileiro
 * @param {Date|string} date - Data/horário a ser formatado
 * @returns {string} Data e hora formatadas
 */
export const formatBrazilDateTime = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleString('pt-BR', { 
    timeZone: BRAZIL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Compara duas datas ignorando o timezone (apenas a data)
 * @param {Date|string} date1 - Primeira data
 * @param {Date|string} date2 - Segunda data
 * @returns {boolean} True se as datas são iguais
 */
export const isSameDate = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Converter para timezone de Brasília e comparar apenas a data
  const brazilDate1 = new Date(d1.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
  const brazilDate2 = new Date(d2.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
  
  return brazilDate1.toDateString() === brazilDate2.toDateString();
};

/**
 * Cria uma data no timezone de Brasília
 * @param {string} dateString - String da data (YYYY-MM-DD)
 * @param {string} timeString - String do horário (HH:MM)
 * @returns {Date} Data criada no timezone de Brasília
 */
export const createBrazilDateTime = (dateString, timeString) => {
  // Criar a data no timezone local primeiro
  const localDate = new Date(`${dateString}T${timeString}`);
  
  // Converter para o timezone de Brasília
  return new Date(localDate.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
};

/**
 * Verifica se uma data é anterior à data atual (em Brasília)
 * @param {Date|string} date - Data a ser verificada
 * @returns {boolean} True se a data é anterior à hoje
 */
export const isDateInPast = (date) => {
  // Se a data for uma string no formato YYYY-MM-DD, usar comparação simples
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    return date < todayString;
  }
  
  // Para objetos Date, usar a lógica anterior
  const dateObj = new Date(date);
  const today = new Date();
  
  // Zerar as horas para comparar apenas a data
  const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  return dateOnly < todayOnly;
};

/**
 * Obtém o início do dia em Brasília
 * @param {Date|string} date - Data base
 * @returns {Date} Início do dia (00:00:00) em Brasília
 */
export const getStartOfDayBrazil = (date) => {
  const dateObj = new Date(date);
  const brazilDate = new Date(dateObj.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
  return new Date(brazilDate.getFullYear(), brazilDate.getMonth(), brazilDate.getDate(), 0, 0, 0);
};

/**
 * Obtém o fim do dia em Brasília
 * @param {Date|string} date - Data base
 * @returns {Date} Fim do dia (23:59:59) em Brasília
 */
export const getEndOfDayBrazil = (date) => {
  const dateObj = new Date(date);
  const brazilDate = new Date(dateObj.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
  return new Date(brazilDate.getFullYear(), brazilDate.getMonth(), brazilDate.getDate(), 23, 59, 59);
};
