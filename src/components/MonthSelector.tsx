import React from 'react';
import { useStore } from '../store/useStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MonthSelector: React.FC = () => {
  const { selectedDate, setSelectedDate } = useStore();
  
  const currentDate = new Date(selectedDate);

  const handlePrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setSelectedDate(prev.toISOString());
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setSelectedDate(next.toISOString());
  };

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <button 
        onClick={handlePrevMonth}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
      >
        <ChevronLeft size={20} />
      </button>
      
      <span className="text-sm font-semibold min-w-[120px] text-center text-gray-800 dark:text-white capitalize">
        {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
      </span>

      <button 
        onClick={handleNextMonth}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
