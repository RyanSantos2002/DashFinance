import React from 'react';
import { useStore } from '../store/useStore';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { StatCard } from '../components/widgets/StatCard';
import { FinancialHealthWidget, SmartAdvisorWidget } from '../components/widgets/CreativeWidgets'; 
import { AnnualSummary } from '../components/AnnualSummary';

export const Principal: React.FC = () => {
  const { currentUser, getSummary } = useStore();
  const summary = getSummary();


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Olá, {currentUser?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Aqui está o resumo das suas finanças hoje.</p>
        </div>
      </div>

      {/* Cards - Restoring 4 cards layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Entradas" value={summary.totalIncome} variant="income" />
        <StatCard title="Saídas" value={summary.totalExpense} variant="expense" />
        <StatCard title="Saldo" value={summary.balance} variant="balance" />
        <StatCard title="Reserva Acumulada" value={summary.reservation} variant="balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form (1/3) */}
        <div className="lg:col-span-1">
             <TransactionForm />
        </div>

        {/* Right Column: List + Widgets (2/3) */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-800 dark:text-white">Últimas Movimentações</h3>
              </div>
              <TransactionList limit={5} />
           </div>

           {/* The "Available Space" filled with Smart Widgets */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="h-81">
                   <FinancialHealthWidget />
               </div>
               <div className="h-81">
                   <SmartAdvisorWidget />
               </div>
           </div>
        </div>
      </div>
      
      {/* Annual Summary Table Restored */}
      <div className="pt-4">
           <AnnualSummary />
      </div>
    </div>
  );
};
