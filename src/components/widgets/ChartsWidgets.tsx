import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { FileBarChart } from 'lucide-react';
import { cn } from '../../utils/cn';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Widget 1: Expenses by Category Pie
export const CategoryPieWidget: React.FC = () => {
  const { transactions, selectedDate } = useStore();

  const categoryData = React.useMemo(() => {
    const targetDate = new Date(selectedDate);
    const expensesByCategory: Record<string, number> = {};
    
    transactions
      .filter(t => {
        const tDate = new Date(t.date);
        const isSameMonth = tDate.getMonth() === targetDate.getMonth() && 
                            tDate.getFullYear() === targetDate.getFullYear();
        return t.type === 'expense' && isSameMonth;
      })
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });
    
    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  }, [transactions, selectedDate]);

  if (categoryData.length === 0) {
      // Return placeholder or empty state
      return (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-96 transition-colors flex items-center justify-center">
             <p className="text-gray-400">Sem dados de categorias para este mês.</p>
         </div>
      );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-96 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Gastos por Categoria</h3>
        <ResponsiveContainer width="100%" height="85%">
        <PieChart>
            <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? 'Outros'} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            >
            {categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            </Pie>
            <RechartsTooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
            itemStyle={{ color: '#f3f4f6' }}
            formatter={(value: number | string | Array<number | string> | undefined) => [formatCurrency(Number(value) || 0), "Valor"]} 
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
        </PieChart>
        </ResponsiveContainer>
    </div>
  );
};

// Widget 2: Monthly Evolution Bar
export const MonthlyHistoryWidget: React.FC = () => {
  const { transactions } = useStore();

  const monthlyData = React.useMemo(() => {
    const data: Record<string, { name: string; income: number; expense: number; dateVal: number }> = {};
    
    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`; 
      const monthName = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });

      if (!data[key]) {
        data[key] = { name: monthName, income: 0, expense: 0, dateVal: d.getTime() };
      }
      if (t.type === 'income') data[key].income += t.amount;
      else data[key].expense += t.amount;
    });

    return Object.values(data).sort((a, b) => a.dateVal - b.dateVal);
  }, [transactions]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-96 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Evolução Mensal</h3>
        <ResponsiveContainer width="100%" height="85%">
        <BarChart
            data={monthlyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <RechartsTooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
            itemStyle={{ color: '#f3f4f6' }}
            formatter={(value: number | string | Array<number | string> | undefined) => [formatCurrency(Number(value) || 0), "Valor"]} 
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
            <Bar dataKey="income" name="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

// Widget 3: Forecast Table
export const ForecastWidget: React.FC = () => {
    const { transactions } = useStore();

    const forecastData = React.useMemo(() => {
        const today = new Date(); 
        
        const items: Array<{
            date: Date;
            description: string;
            amount: number;
            type: 'Fixo' | 'Parcelado' | 'Agendado';
            installmentInfo?: string; 
        }> = [];
    
        // 1. Fixed Expenses (Project for next 12 months)
        transactions.filter(t => t.type === 'expense' && t.isFixed).forEach(t => {
            for(let i=0; i<12; i++) {
                const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
                items.push({
                    date: d,
                    description: t.description,
                    amount: t.amount,
                    type: 'Fixo'
                });
            }
        });
    
        // 2. Installments
        transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && tDate > today;
        }).forEach(t => {
            const tDate = new Date(t.date);
            items.push({
                date: tDate,
                description: t.description.replace(/\(\d+\/\d+\)/, '').trim(), 
                amount: t.amount,
                type: t.installment ? 'Parcelado' : 'Agendado',
                installmentInfo: t.installment ? `${t.installment.current}/${t.installment.total}` : undefined
            });
        });
    
        return items
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 50); 
      }, [transactions]);

      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors h-96 flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 flex-shrink-0">
                <FileBarChart className="text-primary dark:text-blue-400" size={20} />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Previsão de Gastos Futuros</h3>
            </div>
            <div className="overflow-x-auto flex-1 custom-scrollbar">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 sticky top-0 backdrop-blur-sm z-10">
                        <tr>
                            <th className="px-6 py-4">Mês/Ano</th>
                            <th className="px-6 py-4">Descrição</th>
                            <th className="px-6 py-4 text-center">Tipo</th>
                            <th className="px-6 py-4 text-center">Parcela</th>
                            <th className="px-6 py-4 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {forecastData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 capitalize">{item.date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.description}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        item.type === 'Fixo' 
                                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" 
                                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                    )}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    {item.installmentInfo || '-'}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(item.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      );
}
