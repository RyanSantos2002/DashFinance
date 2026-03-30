export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  
  // Try to parse it. If it's a simple YYYY-MM-DD, treat as local time to avoid shift
  if (dateString.length === 10 && dateString.includes('-')) {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  const date = new Date(dateString);
  
  // Add 12 hours ONLY if it's exactly at midnight UTC (T00:00:00) 
  // to push it into the correct local day for users in negative timezones.
  // This avoids double-shifting dates that already have a safe time offset (like T12:00:00).
  if (dateString.includes('T00:00:00')) {
    date.setUTCHours(date.getUTCHours() + 12);
  }
  
  return new Intl.DateTimeFormat('pt-BR').format(date);
};
