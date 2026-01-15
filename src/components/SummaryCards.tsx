import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { cn } from '../utils/cn';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ totalIncome, totalExpense, balance }) => {
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
      <Card 
        title="Reserva (20%)" 
        value={totalIncome * 0.2} 
        icon={PiggyBank} 
        color="text-purple-600"
        bgColor="bg-purple-50"
        subtext="Meta sugerida"
      />
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
