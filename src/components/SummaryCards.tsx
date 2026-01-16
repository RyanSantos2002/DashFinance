import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { cn } from '../utils/cn';
import { useStore } from '../store/useStore';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ totalIncome, totalExpense, balance }) => {
  const { reservationBalance, addToReservation } = useStore();
  
  const handleAddReservation = () => {
    // Simple implementation for now using prompt as requested in plan (quick & functional)
    // In a future polished version we can use a proper Modal component
    const input = window.prompt("Quanto você quer guardar na reserva?");
    if (!input) return;
    
    // Replace comma with dot and parse
    const value = parseFloat(input.replace(',', '.'));
    
    if (isNaN(value) || value <= 0) {
      alert("Por favor, insira um valor válido.");
      return;
    }
    
    addToReservation(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card 
        title="Renda Mensal" 
        value={totalIncome} 
        icon={ArrowUpCircle} 
        color="text-green-600"
        bgColor="bg-green-50"
      />
      <Card 
        title="Despesas" 
        value={totalExpense} 
        icon={ArrowDownCircle} 
        color="text-red-600"
        bgColor="bg-red-50"
      />
      <Card 
        title="Saldo Atual" 
        value={balance} 
        icon={DollarSign} 
        color={balance >= 0 ? "text-blue-600" : "text-red-600"}
        bgColor={balance >= 0 ? "bg-blue-50" : "bg-red-50"}
      />
      
      {/* Interactive Reservation Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between transition-colors group relative">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reserva Acumulada</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(reservationBalance || 0)}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Total guardado</p>
        </div>
        <div className={cn("p-3 rounded-full bg-purple-50 text-purple-600")}>
          <PiggyBank size={24} />
        </div>
        
        {/* Quick Add Button */}
        <button 
          onClick={handleAddReservation}
          className="absolute bottom-4 right-4 bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          title="Adicionar à reserva"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  subtext?: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon: Icon, color, bgColor, subtext }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between transition-colors">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(value)}</h3>
      {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>}
    </div>
    <div className={cn("p-3 rounded-full", bgColor, color)}>
      <Icon size={24} />
    </div>
  </div>
);
