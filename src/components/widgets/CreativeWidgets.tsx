import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Bar } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement 
} from 'chart.js';
import { TrendingDown, AlertCircle, CheckCircle, Lightbulb, AlertTriangle, ShieldCheck } from 'lucide-react';

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement
);

// --- Financial Health Widget ---
export const FinancialHealthWidget: React.FC = () => {
    const { getSummary } = useStore();
    const summary = getSummary();
    
    // Score logic: 
    // 50% = Saving > 20%
    // 30% = Expense < Income
    // 20% = Has Reservation
    const savingsRatio = summary.totalIncome > 0 ? (summary.totalIncome - summary.totalExpense) / summary.totalIncome : 0;
    const hasReservation = summary.reservation > 0;
    
    let score = 0;
    if (savingsRatio > 0.20) score += 50;
    else if (savingsRatio > 0.10) score += 30;
    else if (savingsRatio > 0) score += 10;
    
    if (summary.totalExpense < summary.totalIncome) score += 30;
    if (hasReservation) score += 20;

    const getHealthColor = (s: number) => {
        if (s >= 80) return 'text-green-500';
        if (s >= 50) return 'text-blue-500';
        if (s >= 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getHealthMessage = (s: number) => {
        if (s >= 80) return 'Excelente! Você é um mestre das finanças.';
        if (s >= 50) return 'Muito bom! Continue poupando.';
        if (s >= 30) return 'Atenção! Tente reduzir gastos supérfluos.';
        return 'Cuidado! Suas finanças precisam de socorro.';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between">
            <div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-1">Saúde Financeira</h3>
                <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <span className={getHealthColor(score)}>{score}/100</span>
                    {score >= 50 ? <CheckCircle size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
                </h2>
            </div>
            
            <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                        className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                            score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-blue-500' : score >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                    />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{getHealthMessage(score)}</p>
            </div>
        </div>
    );
};

// --- Top Expenses Widget ---
export const TopExpensesWidget: React.FC = () => {
    const { transactions, selectedDate } = useStore();
    
    const expenses = useMemo(() => {
        const year = new Date(selectedDate).getFullYear();
        const month = new Date(selectedDate).getMonth();
        
        return transactions
            .filter(t => {
                const d = new Date(t.date);
                return t.type === 'expense' && d.getFullYear() === year && d.getMonth() === month;
            })
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }, [transactions, selectedDate]);

    const maxAmount = expenses[0]?.amount || 1;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full overflow-hidden flex flex-col">
            <h3 className="text-gray-600 dark:text-gray-300 font-bold mb-4 flex items-center gap-2">
                <TrendingDown className="text-red-500" size={20} />
                Maiores Gastos
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                {expenses.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Sem gastos este mês.</p>
                ) : (
                    expenses.map(exp => (
                        <div key={exp.id}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[70%]">{exp.description}</span>
                                <span className="text-red-500 font-semibold">R$ {exp.amount.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-red-500 h-2 rounded-full opacity-80" 
                                    style={{ width: `${(exp.amount / maxAmount) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- Weekly Spending Widget ---
export const WeeklySpendingWidget: React.FC = () => {
    const { transactions, selectedDate } = useStore();

    const chartData = useMemo(() => {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const values = new Array(7).fill(0);
        
        const year = new Date(selectedDate).getFullYear();
        const month = new Date(selectedDate).getMonth();

        transactions.forEach(t => {
            const d = new Date(t.date);
            if (t.type === 'expense' && d.getFullYear() === year && d.getMonth() === month) {
                values[d.getDay()] += t.amount;
            }
        });

        return {
            labels: days,
            datasets: [{
                label: 'Gastos',
                data: values,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderRadius: 4,
            }]
        };
    }, [transactions, selectedDate]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { display: false },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-64 flex flex-col">
            <h3 className="text-gray-600 dark:text-gray-300 font-bold mb-4">Gastos por Dia da Semana</h3>
            <div className="flex-1 relative">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

// --- Smart Advisor Widget ---
export const SmartAdvisorWidget: React.FC = () => {
    const { transactions, getSummary } = useStore();
    const summary = getSummary();
    
    // Heuristic: Estimate "Committed" monthly cost based on Fixed expenses + Active Installments
    const committedCost = useMemo(() => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        // 1. Fixed Expenses (recur every month)
        const fixedExpenses = transactions
            .filter(t => t.type === 'expense' && t.isFixed)
            .reduce((acc, t) => acc + t.amount, 0);

        // 2. Active Installments for next month
        const installmentExpenses = transactions
            .filter(t => {
                if (t.type !== 'expense' || !t.installment) return false;
                // Check if next month is within range (roughly)
                // For MVP, we presume if current < total, it likely continues next month.
                return t.installment.current < t.installment.total;
            })
            .reduce((acc, t) => acc + t.amount, 0);

        return fixedExpenses + installmentExpenses;
    }, [transactions]);

    // Heuristics for Advice
    // Assume average income is current month's income (simplified for now)
    const avgIncome = summary.totalIncome || 1; 
    const freeFlow = avgIncome - committedCost;
    const margin = freeFlow / avgIncome; // % of income free

    let status: 'safe' | 'warning' | 'danger' = 'safe';
    let title = "Tudo sob controle";
    let message = "Suas projeções para o próximo mês indicam estabilidade. Continue assim!";

    if (margin < 0) {
        status = 'danger';
        title = "Atenção: Risco de Saldo Negativo";
        message = `Cuidado! Seus custos fixos projetados para o próximo mês (R$ ${committedCost.toFixed(2)}) superam sua renda atual. Corte gastos agora!`;
    } else if (margin < 0.20) {
        status = 'warning';
        title = "Orçamento Apertado";
        message = `O próximo mês será justo. Você terá apenas R$ ${freeFlow.toFixed(2)} livres após os fixos. Evite novas parcelas.`;
    } else {
        status = 'safe';
        title = "Saúde Financeira Boa";
        message = `Você tem uma margem segura de R$ ${freeFlow.toFixed(2)} projetada para o próximo mês. Que tal investir o excedente?`;
    }

    return (
        <div className={`p-6 rounded-2xl shadow-md border h-full flex flex-col gap-4 relative overflow-hidden transition-all ${
            status === 'danger' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800' :
            status === 'warning' ? 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800' :
            'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800'
        }`}>
            {/* Header */}
            <div className="flex items-start gap-4 z-10">
                <div className={`p-3 rounded-xl shadow-sm ${
                    status === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-white' :
                    status === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-800 dark:text-white' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-white'
                }`}>
                    {status === 'danger' ? <AlertTriangle size={24} /> : 
                     status === 'warning' ? <AlertCircle size={24} /> : 
                     <Lightbulb size={24} />}
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mt-2 bg-white/50 dark:bg-black/20 p-4 rounded-xl">
                 <div>
                     <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Custos Fixos (Mês que vem)</span>
                     <p className="font-semibold text-gray-800 dark:text-white">R$ {committedCost.toFixed(2)}</p>
                 </div>
                 <div>
                     <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Livre Estimado</span>
                     <p className={`font-semibold ${freeFlow < 0 ? 'text-red-500' : 'text-green-500'}`}>
                         R$ {freeFlow.toFixed(2)}
                     </p>
                 </div>
            </div>

            {/* Action Tip */}
            {status === 'safe' && (
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 mt-2">
                    <ShieldCheck size={16} />
                    <span>Dica: Ótimo momento para aportar em seus investimentos.</span>
                </div>
            )}
        </div>
    );
};
