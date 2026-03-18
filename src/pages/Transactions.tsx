import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatDate, formatCurrency } from '../utils/format';
import { Trash2, ArrowUp, ArrowDown, Search, Calendar, X, Pencil } from 'lucide-react';
import { TransactionForm } from '../components/TransactionForm';
import { cn } from '../utils/cn';
import { type TransactionType, type Category } from '../types';

const CATEGORIES: Category[] = [
  'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros', 'Salário'
];

export const Transactions: React.FC = () => {
  const { transactions, removeTransaction } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      
      const transactionDate = new Date(t.date).getTime();
      const matchesStartDate = !startDate || transactionDate >= new Date(startDate).getTime();
      const matchesEndDate = !endDate || transactionDate <= new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1); // include entire end day
      
      return matchesSearch && matchesType && matchesCategory && matchesStartDate && matchesEndDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Todas as Movimentações</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary transition-all">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                className="bg-transparent border-none outline-none text-sm dark:text-white"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-gray-400">até</span>
              <input
                type="date"
                className="bg-transparent border-none outline-none text-sm dark:text-white"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-red-500"
                  title="Limpar datas"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="all">Todos os Tipos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
            >
              <option value="all">Todas Categorias</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Pagamento</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {t.description}
                    {t.installment && (
                      <span className="ml-2 text-xs text-blue-500">
                        ({t.installment.current}/{t.installment.total})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {t.paymentMethod || '-'}
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingTransaction(t)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Deseja excluir esta transação?')) {
                            removeTransaction(t.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              Nenhuma transação encontrada com os filtros selecionados.
            </div>
          )}
        </div>
      </div>

      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-lg relative">
            <div className="max-h-[90vh] overflow-y-auto rounded-xl">
              <TransactionForm 
                transaction={editingTransaction} 
                onSuccess={() => setEditingTransaction(null)} 
              />
            </div>
            <button 
              onClick={() => setEditingTransaction(null)}
              className="absolute -top-12 -right-0 md:-right-12 text-white hover:text-gray-200 transition-colors"
              title="Fechar"
            >
              <X size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
