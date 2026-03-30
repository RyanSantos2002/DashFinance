import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/format';
import { Plus, CreditCard as CardIcon, Trash2, ChevronLeft, ChevronRight, X, Calendar, ArrowUpRight } from 'lucide-react';
import { cn } from '../utils/cn';
import { type CreditCard } from '../types';

export const CreditCards: React.FC = () => {
  const { creditCards, transactions, addCreditCard, removeCreditCard } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '',
    limit: '',
    closingDay: 1,
    dueDay: 10,
    color: '#3b82f6'
  });
  const [selectedCardForStatement, setSelectedCardForStatement] = useState<CreditCard | null>(null);
  const [statementDate, setStatementDate] = useState(new Date());

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
            <div 
              key={card.id} 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-all hover:shadow-md group cursor-pointer"
              onClick={() => setSelectedCardForStatement(card)}
            >
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
                
                <button 
                  className="w-full py-2 text-sm font-medium text-primary dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Ver Fatura Detalhada
                  <ArrowUpRight size={16} />
                </button>
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

      {/* Add Card Modal */}
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

      {/* Card Statement Modal */}
      {selectedCardForStatement && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header with Card Gradient */}
            <div 
              className="p-8 text-white relative flex-shrink-0"
              style={{ backgroundColor: selectedCardForStatement.color }}
            >
              <button 
                onClick={() => setSelectedCardForStatement(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <CardIcon size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedCardForStatement.name}</h2>
                  <p className="text-white/70 text-sm">Fatura e Detalhes</p>
                </div>
              </div>

              {/* Month Selector inside header */}
              <div className="flex items-center justify-between bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <button 
                  onClick={() => setStatementDate(new Date(statementDate.setMonth(statementDate.getMonth() - 1)))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Período Selecionado</p>
                  <p className="text-lg font-bold">
                    {statementDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <button 
                  onClick={() => setStatementDate(new Date(statementDate.setMonth(statementDate.getMonth() + 1)))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
              {(() => {
                const filteredTransactions = transactions.filter(t => {
                  const tDate = new Date(t.date);
                  return t.creditCardId === selectedCardForStatement.id &&
                         tDate.getMonth() === statementDate.getMonth() &&
                         tDate.getFullYear() === statementDate.getFullYear();
                });

                const monthlyTotal = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

                return (
                  <div className="space-y-8">
                    {/* Monthly Stats Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total na Fatura</p>
                        <p className="text-xl font-bold text-red-500">{formatCurrency(monthlyTotal)}</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Limite do Cartão</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedCardForStatement.limit)}</p>
                      </div>
                    </div>

                    {/* Transaction List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="font-bold text-gray-800 dark:text-gray-200">Lançamentos</h3>
                         <span className="text-xs text-gray-500">{filteredTransactions.length} itens</span>
                      </div>
                      
                      <div className="space-y-1">
                        {filteredTransactions.map(t => (
                          <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                <Calendar size={18} className="text-gray-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{t.description}</p>
                                <p className="text-xs text-gray-500">{formatDate(t.date)} • {t.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-500">-{formatCurrency(t.amount)}</p>
                              {t.installment && (
                                <p className="text-[10px] text-blue-500 font-medium">Parcela {t.installment.current}/{t.installment.total}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {filteredTransactions.length === 0 && (
                          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Calendar size={24} className="opacity-20" />
                            </div>
                            <p>Nenhuma transação encontrada para este período.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
               <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                     <p className="text-gray-500 dark:text-gray-400">Vencimento da Fatura</p>
                     <p className="font-bold text-gray-900 dark:text-white">Dia {selectedCardForStatement.dueDay}</p>
                  </div>
                  <div className="text-right text-sm">
                     <p className="text-gray-500 dark:text-gray-400">Fechamento</p>
                     <p className="font-bold text-gray-900 dark:text-white">Dia {selectedCardForStatement.closingDay}</p>
                  </div>
               </div>
               <button 
                onClick={() => setSelectedCardForStatement(null)}
                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:opacity-90 transition-opacity"
               >
                 Fechar Fatura
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
