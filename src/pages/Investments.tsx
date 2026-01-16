import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { TrendingUp, Plus, Trash2, Wallet, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { InvestmentType, Investment } from '../types';
import { marketService } from '../services/market';

ChartJS.register(ArcElement, Tooltip, Legend);

export const Investments: React.FC = () => {
    const store = useStore();
    const investments = store.investments || [];
    const fetchInvestments = store.fetchInvestments;
    const fetchTransactions = store.fetchTransactions;
    const addInvestment = store.addInvestment;
    const removeInvestment = store.removeInvestment;
    const currentUser = store.currentUser;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState<InvestmentType>('Ações');
    const [amountInvested, setAmountInvested] = useState('');
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        if (currentUser) {
            fetchInvestments();
            fetchTransactions();
        }
    }, [currentUser, fetchInvestments, fetchTransactions]);

    // Fetch Live Quotes when investments change
    useEffect(() => {
        const fetchLivePrices = async () => {
            if (investments.length === 0) return;
            
            setIsLoadingQuotes(true);
            // Get unique tickers (names)
            const tickers = [...new Set(investments.map(i => i.name))];
            const quotes = await marketService.getQuotes(tickers);
            
            const newPrices: Record<string, number> = {};
            tickers.forEach(t => {
                if (quotes[t]) {
                    newPrices[t] = quotes[t].currentPrice;
                }
            });
            setPrices(prev => ({ ...prev, ...newPrices }));
            setIsLoadingQuotes(false);
        };

        fetchLivePrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [investments.length, JSON.stringify(investments.map(i => i.name))]);

    // Helper to get current value (Live or Fallback)
    const getCurrentValue = (investment: Investment) => {
        const livePrice = prices[investment.name];
        if (livePrice !== undefined) {
            return livePrice * investment.quantity;
        }
        // Fallback to manually stored value IF we didn't find a price, 
        // OR just assume break-even/initial value if really nothing exists.
        // For this new logic, we'll try to rely on live price, else default to invested amount (safe assumption) or stored current
        return investment.currentValue > 0 ? investment.currentValue : investment.amountInvested;
    };

    // Derived stats with Live Data
    const totalInvested = investments.reduce((acc, curr) => acc + curr.amountInvested, 0);
    const totalCurrent = investments.reduce((acc, curr) => acc + getCurrentValue(curr), 0);
    const profit = totalCurrent - totalInvested;
    const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    // Chart Data
    const allocationData = {
        labels: investments.length > 0 ? [...new Set(investments.map(i => i.type))] : ['Vazio'],
        datasets: [
          {
            data: investments.length > 0 
                ? [...new Set(investments.map(i => i.type))].map(type => 
                    investments.filter(i => i.type === type).reduce((sum, i) => sum + getCurrentValue(i), 0)
                  )
                : [1],
            backgroundColor: [
              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'
            ],
            borderWidth: 0,
          },
        ],
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // For new investments, we set currentValue same as invested initially
            // The live quote will update it visually afterwards
            await addInvestment({
                name: name.toUpperCase(), // Force uppercase for tickers
                type,
                amountInvested: Number(amountInvested),
                currentValue: Number(amountInvested), // Initial = Invested
                quantity: Number(quantity),
                date: new Date().toISOString()
            });
            setIsModalOpen(false);
            // Reset form
            setName('');
            setAmountInvested('');
            setQuantity('');
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar o investimento. Verifique se você rodou o script SQL no Supabase!");
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header / Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                     <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <TrendingUp className="text-primary" />
                        Carteira de Investimentos
                        {isLoadingQuotes && <RefreshCw className="animate-spin text-gray-400" size={16} />}
                     </h2>
                     <p className="text-gray-500 dark:text-gray-400">
                        Cotações em tempo real (aprox. 15min delay)
                     </p>
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Novo Ativo
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                            <Wallet size={20} />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Patrimônio Atual</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCurrent)}
                    </p>
                 </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                            <PieIcon size={20} />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Investido</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvested)}
                    </p>
                 </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${profit >= 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                            {profit >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Lucro / Prejuízo</span>
                    </div>
                    <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '+' : ''} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(profit)}
                        <span className="text-sm font-normal ml-2 opacity-80">
                            ({profitPercent.toFixed(2)}%)
                        </span>
                    </p>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Chart */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-1 flex flex-col items-center justify-center">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 self-start">Alocação</h3>
                      <div className="w-48 h-48 relative">
                          <Doughnut data={allocationData} options={{ maintainAspectRatio: true, plugins: { legend: { display: false } } }} />
                      </div>
                      <div className="mt-4 w-full space-y-2">
                          {investments.length === 0 && <p className="text-center text-sm text-gray-400">Nenhum dado.</p>}
                          {[...new Set(investments.map(i => i.type))].map((type, idx) => (
                              <div key={type} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: allocationData.datasets[0].backgroundColor[idx % 6] }}></div>
                                      <span className="text-gray-600 dark:text-gray-300">{type}</span>
                                  </div>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {(investments.filter(i => i.type === type).reduce((sum, i) => sum + getCurrentValue(i), 0) / (totalCurrent || 1) * 100).toFixed(1)}%
                                  </span>
                              </div>
                          ))}
                      </div>
                 </div>

                 {/* List */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2 overflow-hidden">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Meus Ativos</h3>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="border-b dark:border-gray-700 text-xs text-gray-400 uppercase">
                                      <th className="py-3 font-medium text-gray-600 dark:text-gray-400">Ativo</th>
                                      <th className="py-3 font-medium text-right text-gray-600 dark:text-gray-400">Qtd</th>
                                      <th className="py-3 font-medium text-right text-gray-600 dark:text-gray-400">Preço Médio</th>
                                      <th className="py-3 font-medium text-right text-gray-600 dark:text-gray-400">Preço Atual</th>
                                      <th className="py-3 font-medium text-right text-gray-600 dark:text-gray-400">Saldo Atual</th>
                                      <th className="py-3 font-medium text-right text-gray-600 dark:text-gray-400">Retorno</th>
                                      <th className="py-3 font-medium text-right text-gray-600 dark:text-gray-400">Ações</th>
                                  </tr>
                              </thead>
                              <tbody className="text-sm">
                                  {investments.length === 0 ? (
                                      <tr>
                                          <td colSpan={7} className="py-8 text-center text-gray-400">
                                              Nenhum investimento cadastrado.
                                          </td>
                                      </tr>
                                  ) : (
                                      investments.map(item => {
                                          const currentVal = getCurrentValue(item);
                                          const itemProfit = currentVal - item.amountInvested;
                                          const itemProfitPercent = (itemProfit / item.amountInvested) * 100;
                                          const avgPrice = item.amountInvested / (item.quantity || 1);
                                          const livePrice = prices[item.name] || (item.currentValue / (item.quantity || 1));

                                          return (
                                              <tr key={item.id} className="border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                  <td className="py-3 font-medium text-gray-900 dark:text-white">
                                                      {item.name}
                                                      <span className="block text-xs text-gray-400 font-normal">{item.type}</span>
                                                  </td>
                                                  <td className="py-3 text-right text-gray-600 dark:text-gray-300">{item.quantity}</td>
                                                  <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                                                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(avgPrice)}
                                                  </td>
                                                  <td className="py-3 text-right text-gray-900 dark:text-white font-medium">
                                                       {prices[item.name] ? (
                                                            <span className="text-blue-600 dark:text-blue-400">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(livePrice)}
                                                            </span>
                                                       ) : (
                                                            <span className="text-gray-400 text-xs italic">--</span>
                                                       )}
                                                  </td>
                                                  <td className="py-3 text-right font-bold text-gray-900 dark:text-white">
                                                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentVal)}
                                                  </td>
                                                  <td className="py-3 text-right">
                                                      <div className={`flex flex-col items-end ${itemProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                          <span className="font-bold text-xs">
                                                              {itemProfitPercent > 0 ? '+' : ''}{itemProfitPercent.toFixed(1)}%
                                                          </span>
                                                          <span className="text-xs opacity-80">
                                                              {itemProfit > 0 ? '+' : ''}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(itemProfit)}
                                                          </span>
                                                      </div>
                                                  </td>
                                                  <td className="py-3 text-right">
                                                      <button onClick={() => removeInvestment(item.id)} className="text-red-500 hover:text-red-700 p-1 opacity-50 hover:opacity-100 transition-opacity">
                                                          <Trash2 size={16} />
                                                      </button>
                                                  </td>
                                              </tr>
                                          );
                                      })
                                  )}
                              </tbody>
                          </table>
                      </div>
                 </div>
            </div>

            {/* Modal Add (Updated - No Manual Current Value) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Novo Investimento</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código do Ativo (Ticker)</label>
                                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: PETR4, MXRF11, IVVB11..." className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white uppercase" />
                                <p className="text-xs text-gray-500 mt-1">Use o código da Bolsa (B3) para cotação automática.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                    <select value={type} onChange={e => setType(e.target.value as InvestmentType)} className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                        <option value="Ações">Ações</option>
                                        <option value="FIIs">FIIs</option>
                                        <option value="Renda Fixa">Renda Fixa</option>
                                        <option value="Crypto">Crypto</option>
                                        <option value="Fundos">Fundos</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade</label>
                                    <input required type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Total Investido (R$)</label>
                                <input required type="number" step="0.01" value={amountInvested} onChange={e => setAmountInvested(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                                <p className="text-xs text-gray-500 mt-1">Quanto você tirou do bolso para comprar isso.</p>
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Adicionar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
