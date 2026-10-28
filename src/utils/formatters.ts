/**
 * Formatadores utilitários para TudoOk (padrão pt-BR)
 */

export const formatCurrency = (value: number, includeSign: boolean = false): string => {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.abs(value));

  if (includeSign) {
    if (value > 0) return `+ ${formatted}`;
    if (value < 0) return `- ${formatted}`;
  }
  return value < 0 ? `- ${formatted}` : formatted;
};

export const formatPercent = (value: number, includeSign: boolean = true): string => {
  const sign = value > 0 ? '+' : '';
  const formatted = `${value.toFixed(2).replace('.', ',')}%`;
  return includeSign && value > 0 ? `${sign}${formatted}` : formatted;
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(date).replace('.', '');
  } catch {
    return dateString;
  }
};
