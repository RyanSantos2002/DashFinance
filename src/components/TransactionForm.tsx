import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Category, TransactionType } from '../types';
import { cn } from '../utils/cn';
import { PlusCircle } from 'lucide-react';

const CATEGORIES: Category[] = [
  'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'
];

export const TransactionForm: React.FC = () => {
  const addTransaction = useStore((state) => state.addTransaction);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as TransactionType,
    category: 'Outros' as Category,
    date: new Date().toISOString().split('T')[0],
    isFixed: false,
    isInstallment: false,
    installments: 2
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    if (formData.isInstallment && formData.type === 'expense') {
      const totalAmount = Number(formData.amount);
      const installmentAmount = totalAmount / formData.installments;
      const baseDate = new Date(formData.date);

      for (let i = 0; i < formData.installments; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);

        addTransaction({
          description: `${formData.description} (${i + 1}/${formData.installments})`,
          amount: installmentAmount,
          type: formData.type,
          category: formData.category,
          date: date.toISOString(),
          installment: {
            current: i + 1,
            total: formData.installments
          }
        });
      }
    } else {
      addTransaction({
        description: formData.description,
        amount: Number(formData.amount),
        type: formData.type,
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        isFixed: formData.isFixed,
      });
    }

    setFormData(prev => ({ 
      ...prev, 
      description: '', 
      amount: '', 
      isFixed: false, 
      isInstallment: false, 
      installments: 2 
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
        <PlusCircle size={20} className="text-primary dark:text-blue-400" />
        Nova Transação
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Description and Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <input
              type="text"
              required
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Ex: Salário, Mercado..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
        </div>

        {/* Row 2: Type - Full Width */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo da Transação</label>
          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              type="button"
              className={cn(
                "py-3 px-4 rounded-lg font-medium transition-all text-sm border flex items-center justify-center",
                formData.type === 'income' 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 ring-2 ring-green-500/20" 
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              onClick={() => setFormData({ ...formData, type: 'income' })}
            >
              Entrada
            </button>
            <button
              type="button"
              className={cn(
                "py-3 px-4 rounded-lg font-medium transition-all text-sm border flex items-center justify-center",
                formData.type === 'expense' 
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 ring-2 ring-red-500/20" 
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              onClick={() => setFormData({ ...formData, type: 'expense' })}
            >
              Saída
            </button>
          </div>
        </div>

        {/* Row 3: Category ("Below Type" as requested) */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
            <select
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all h-[50px]"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
        </div>

        {/* Row 4: Date ("Increase size" - making it full width) */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
            <input
              type="date"
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all h-[50px]"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
        </div>

        {formData.type === 'expense' && (
           <div className="space-y-4 pt-2">
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   id="isFixed"
                   className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                   checked={formData.isFixed}
                   onChange={(e) => setFormData({ ...formData, isFixed: e.target.checked, isInstallment: false })}
                 />
                 <label htmlFor="isFixed" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">Gasto Fixo (mensal)</label>
               </div>

               <div className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   id="isInstallment"
                   className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                   checked={formData.isInstallment}
                   onChange={(e) => setFormData({ ...formData, isInstallment: e.target.checked, isFixed: false })}
                 />
                 <label htmlFor="isInstallment" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">Parcelado</label>
               </div>
             </div>

             {formData.isInstallment && (
               <div className="space-y-2 animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade de Parcelas</label>
                  <input
                    type="number"
                    min="2"
                    max="120"
                    className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={formData.installments}
                    onChange={(e) => setFormData({ ...formData, installments: Number(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Serão criadas {formData.installments} saídas de {((Number(formData.amount) || 0) / formData.installments).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
               </div>
             )}
           </div>
        )}

        <button
          type="submit"
          className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-sm mt-4 active:scale-[0.99] h-[50px] flex items-center justify-center"
        >
          Adicionar Transação
        </button>
      </form>
    </div>
  );
};
