import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/format';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '../utils/cn';

export const AnnualSummary: React.FC = () => {
    const { transactions, investments } = useStore();
    const currentYear = new Date().getFullYear();

    const annualData = useMemo(() => {
        const data = Array.from({ length: 12 }, (_, i) => ({
            month: i,
            income: 0,
            expense: 0,
            investment: 0,
            balance: 0
        }));

        // Helper to add value to a specific month
        const addValue = (monthIndex: number, amount: number, type: 'income' | 'expense' | 'investment') => {
            if (monthIndex >= 0 && monthIndex < 12) {
                if (type === 'income') data[monthIndex].income += amount;
                else if (type === 'expense') data[monthIndex].expense += amount;
                else if (type === 'investment') data[monthIndex].investment += amount;
            }
        };

        // 1. Process Fixed Transactions (Project for whole year)
        transactions.filter(t => t.isFixed).forEach(t => {
            for (let i = 0; i < 12; i++) {
                addValue(i, t.amount, t.type);
            }
        });

        // 2. Process Existing & Future Transactions
        transactions.filter(t => !t.isFixed).forEach(t => {
            const date = new Date(t.date);
            if (date.getFullYear() === currentYear) {
                addValue(date.getMonth(), t.amount, t.type);
            }
        });

        // 3. Process Investments (Treat as outflow for cash flow purposes)
        investments.forEach(inv => {
            const date = new Date(inv.date);
            if (date.getFullYear() === currentYear) {
                addValue(date.getMonth(), inv.amountInvested, 'investment');
            }
        });

        // Calculate balances: Income - Expenses - Investments
        data.forEach(m => m.balance = m.income - m.expense - m.investment);

        return data;
    }, [transactions, investments, currentYear]);

    const annualTotal = annualData.reduce((acc, curr) => ({
        income: acc.income + curr.income,
        expense: acc.expense + curr.expense,
        investment: acc.investment + curr.investment,
        balance: acc.balance + curr.balance
    }), { income: 0, expense: 0, investment: 0, balance: 0 });

    return (
        <div className="space-y-6">
             <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-gray-500 dark:text-gray-400" size={24} />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Projeção Anual ({currentYear})</h2>
             </div>

             {/* Annual Totals */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                 <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                     <p className="text-sm text-green-600 dark:text-green-400 font-medium">Receita Anual Prevista</p>
                     <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(annualTotal.income)}</p>
                 </div>
                 <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                     <p className="text-sm text-red-600 dark:text-red-400 font-medium">Despesa Anual Prevista</p>
                     <p className="text-2xl font-bold text-red-700 dark:text-red-300">{formatCurrency(annualTotal.expense)}</p>
                 </div>
                 <div className={cn(
                     "p-4 rounded-xl border",
                     annualTotal.balance >= 0 
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800" 
                        : "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800"
                 )}>
                     <p className={cn("text-sm font-medium", annualTotal.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400")}>
                         Saldo Anual Previsto
                     </p>
                     <p className={cn("text-2xl font-bold", annualTotal.balance >= 0 ? "text-blue-700 dark:text-blue-300" : "text-orange-700 dark:text-orange-300")}>
                         {formatCurrency(annualTotal.balance)}
                     </p>
                 </div>
             </div>

             {/* Monthly Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {annualData.map((data) => {
                     const date = new Date(currentYear, data.month, 1);
                     const isNegative = data.balance < 0;
                     return (
                         <div key={data.month} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow">
                             <div className="flex justify-between items-center mb-3">
                                 <h3 className="font-bold text-gray-700 dark:text-gray-200 capitalize">
                                     {format(date, 'MMMM', { locale: ptBR })}
                                 </h3>
                                 {isNegative ? (
                                     <TrendingDown size={16} className="text-red-500" />
                                 ) : (
                                     <TrendingUp size={16} className="text-green-500" />
                                 )}
                             </div>
                             
                             <div className="space-y-1 text-sm">
                                 <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                     <span>Entradas</span>
                                     <span className="text-green-600 dark:text-green-400">{formatCurrency(data.income)}</span>
                                 </div>
                                 <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                     <span>Saídas</span>
                                     <span className="text-red-500 dark:text-red-400">{formatCurrency(data.expense)}</span>
                                 </div>
                                 <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                     <span>Investimentos</span>
                                     <span className="text-blue-500 dark:text-blue-400">{formatCurrency(data.investment)}</span>
                                 </div>
                                 <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between font-bold">
                                     <span className="text-gray-700 dark:text-gray-300">Saldo</span>
                                     <span className={isNegative ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}>
                                         {formatCurrency(data.balance)}
                                     </span>
                                 </div>
                             </div>
                         </div>
                     );
                 })}
             </div>
        </div>
    );
};
