import React from 'react';
import { useStore } from '../store/useStore';
import { formatDate, formatCurrency } from '../utils/format';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../utils/cn';

interface TransactionListProps {
  limit?: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({ limit }) => {
  const { transactions, removeTransaction, selectedDate } = useStore();

  const sortedTransactions = [...transactions]
    .filter(t => {
      const tDate = new Date(t.date);
      const sDate = new Date(selectedDate);
      return tDate.getMonth() === sDate.getMonth() && 
             tDate.getFullYear() === sDate.getFullYear();
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit); // Apply limit

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center transition-colors">
        <p className="text-gray-500 dark:text-gray-400">Nenhuma transação registrada ainda.</p>
      </div>
    );
  }

  const Container = limit ? React.Fragment : 'div';
  const containerProps = limit ? {} : { className: "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors" };

  return (
    <Container {...containerProps}>
      {!limit && (
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Histórico Recente</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(t.date)}</td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t.description}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {t.category}
                  </span>
                </td>
                <td className={cn("px-6 py-4 text-right font-semibold", 
                  t.type === 'income' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  <div className="flex items-center justify-end gap-1">
                    {t.type === 'income' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {formatCurrency(t.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => removeTransaction(t.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
};
