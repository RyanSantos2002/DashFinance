import React from 'react';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/format';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, type LucideIcon } from 'lucide-react'; // Fix type import and remove PiggyBank

interface StatCardProps {
  title: string;
  value: number;
  icon?: LucideIcon;
  variant: 'income' | 'expense' | 'balance' | 'default';
  subtext?: string;
}

const VARIANTS = {
  income: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: ArrowUpCircle
  },
  expense: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: ArrowDownCircle
  },
  balance: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: DollarSign
  },
  default: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: DollarSign
  }
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, variant, subtext, icon: CustomIcon }) => {
    const style = VARIANTS[variant] || VARIANTS.default;
    const Icon = CustomIcon || style.icon;

    // Adjust color for balance if negative
    const finalColor = (variant === 'balance' && value < 0) ? 'text-red-600' : style.color;
    const finalBg = (variant === 'balance' && value < 0) ? 'bg-red-50' : style.bgColor;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between transition-colors h-full">
            <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(value)}</h3>
            {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>}
            </div>
            <div className={cn("p-3 rounded-full", finalBg, finalColor)}>
            <Icon size={24} />
            </div>
        </div>
    );
};
