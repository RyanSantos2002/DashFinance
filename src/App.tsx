import { Layout } from './components/Layout';
import { SummaryCards } from './components/SummaryCards';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Charts } from './components/Charts';
import { useStore } from './store/useStore';
import { AuthGuard } from './components/AuthGuard';

function App() {
  const { getSummary } = useStore();
  const summary = getSummary();

  return (
    <AuthGuard>
      <Layout>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Visão Geral</h2>
          <p className="text-gray-500 dark:text-gray-400">Acompanhe suas finanças em tempo real.</p>
        </div>
        
        <SummaryCards 
          totalIncome={summary.totalIncome} 
          totalExpense={summary.totalExpense} 
          balance={summary.balance} 
        />

        <div className="mt-8">
          <Charts />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 pb-8">
          <div className="lg:col-span-1">
            <TransactionForm />
          </div>
          <div className="lg:col-span-2">
            <TransactionList />
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}

export default App;
