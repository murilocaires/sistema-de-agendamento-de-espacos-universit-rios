// Configuração global de timezone para a aplicação
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

// Configuração do Intl.DateTimeFormat para usar o timezone de Brasília
export const BRAZIL_LOCALE = 'pt-BR';

// Configurações padrão para formatação de data
export const DATE_FORMAT_OPTIONS = {
  timeZone: BRAZIL_TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
};

// Configurações padrão para formatação de horário
export const TIME_FORMAT_OPTIONS = {
  timeZone: BRAZIL_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit'
};

// Configurações padrão para formatação de data e horário
export const DATETIME_FORMAT_OPTIONS = {
  timeZone: BRAZIL_TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
};

// Configurações para formatação de mês e ano (usado no calendário)
export const MONTH_YEAR_FORMAT_OPTIONS = {
  timeZone: BRAZIL_TIMEZONE,
  month: 'long',
  year: 'numeric'
};
