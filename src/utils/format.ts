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
  // Add 12 hours if it looks like a UTC midnight string to push it into the correct local day
  if (dateString.endsWith('T00:00:00.000Z') || dateString.endsWith('Z')) {
    date.setHours(date.getHours() + 12);
  }
  
  return new Intl.DateTimeFormat('pt-BR').format(date);
};
