import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/format';
import { Plus, CreditCard as CardIcon, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';

export const CreditCards: React.FC = () => {
  const { creditCards, transactions, addCreditCard, removeCreditCard, fetchCreditCards } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '',
    limit: '',
    closingDay: 1,
    dueDay: 10,
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchCreditCards();
  }, []);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    addCreditCard({
      name: newCard.name,
      limit: Number(newCard.limit),
      closingDay: newCard.closingDay,
      dueDay: newCard.dueDay,
      color: newCard.color
    });
    setShowAddModal(false);
    setNewCard({ name: '', limit: '', closingDay: 1, dueDay: 10, color: '#3b82f6' });
  };

  const getCardStatement = (cardId: string) => {
    return transactions.filter(t => t.creditCardId === cardId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Cartões</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-colors"
        >
          <Plus size={20} />
          Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {creditCards.map(card => {
          const statement = getCardStatement(card.id);
          const totalSpent = statement.reduce((acc, t) => acc + t.amount, 0);
          
          return (
            <div key={card.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-colors">
              {/* Virtual Card Rendering */}
              <div 
                className="p-6 text-white relative h-48 flex flex-col justify-between"
                style={{ backgroundColor: card.color }}
              >
                <div className="flex justify-between items-start">
                   <CardIcon size={32} />
                   <button 
                    onClick={() => { if(confirm('Excluir cartão?')) removeCreditCard(card.id) }}
                    className="text-white/70 hover:text-white transition-colors"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
                <div>
                   <p className="text-sm opacity-80 uppercase tracking-widest">{card.name}</p>
                   <p className="text-2xl font-bold mt-1">**** **** **** ****</p>
                </div>
                <div className="flex justify-between items-end">
                   <div>
                     <p className="text-xs opacity-70">Fechamento: Dia {card.closingDay}</p>
                     <p className="text-xs opacity-70">Vencimento: Dia {card.dueDay}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-xs opacity-70">Limite Disponível</p>
                     <p className="text-lg font-semibold">{formatCurrency(card.limit - totalSpent)}</p>
                   </div>
                </div>
              </div>

              {/* Summary & Statement */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Fatura Atual</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(totalSpent)}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (totalSpent / card.limit) * 100)}%` }}
                  ></div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-sm font-semibold mb-3">Últimos Lançamentos</h4>
                  <div className="space-y-3">
                    {statement.slice(0, 3).map(t => (
                      <div key={t.id} className="flex justify-between items-center text-xs">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{t.description}</p>
                          <p className="text-gray-400">{formatDate(t.date)}</p>
                        </div>
                        <span className="font-semibold text-red-500">{formatCurrency(t.amount)}</span>
                      </div>
                    ))}
                    {statement.length === 0 && <p className="text-xs text-gray-400 italic">Nenhum lançamento neste cartão.</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {creditCards.length === 0 && (
          <div className="lg:col-span-2 p-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center">
             <CardIcon className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
             <p className="text-gray-500 dark:text-gray-400">Você ainda não cadastrou nenhum cartão de crédito.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl transition-colors">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-primary" />
              Novo Cartão de Crédito
            </h2>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Cartão</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Nubank, Inter..."
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-primary focus:ring-2"
                  value={newCard.name}
                  onChange={e => setNewCard({...newCard, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Limite Total</label>
                <input
                  required
                  type="number"
                  placeholder="0,00"
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-primary focus:ring-2"
                  value={newCard.limit}
                  onChange={e => setNewCard({...newCard, limit: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dia Fechamento</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-primary focus:ring-2"
                    value={newCard.closingDay}
                    onChange={e => setNewCard({...newCard, closingDay: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dia Vencimento</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-primary focus:ring-2"
                    value={newCard.dueDay}
                    onChange={e => setNewCard({...newCard, dueDay: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cor do Cartão</label>
                <div className="flex gap-2 flex-wrap">
                  {['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#1e293b'].map(c => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-transform",
                        newCard.color === c ? "scale-110 border-white shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => setNewCard({...newCard, color: c})}
                    ></button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-colors font-medium"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
