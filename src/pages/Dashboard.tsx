import React from 'react';
import { DraggableGrid } from '../components/dnd/DraggableGrid';
import { CategoryPieWidget, MonthlyHistoryWidget, ForecastWidget } from '../components/widgets/ChartsWidgets';
import { FinancialHealthWidget, TopExpensesWidget, WeeklySpendingWidget } from '../components/widgets/CreativeWidgets'; // Added import
import { useStore } from '../store/useStore';
import { WidgetSelector } from '../components/widgets/WidgetSelector';
import { type WidgetType } from '../components/widgets/registry';
import { StatCard } from '../components/widgets/StatCard';
import { ReservationWidget } from '../components/widgets/ReservationWidget';

// Use new ID format for defaults too to be consistent, though legacy support exists
const DEFAULT_ANALYTICS_WIDGETS = ['financial_health_default', 'top_expenses_default', 'forecast_default', 'history_default', 'category_pie_default']; // Updated default dashboard

export const Dashboard: React.FC = () => {
    // ... existing hook logic ... 
    const { currentUser, updateLayout, getSummary, fetchTransactions } = useStore();
    const summary = getSummary(); 
  
    React.useEffect(() => {
      if (currentUser) {
          fetchTransactions();
      }
    }, [fetchTransactions, currentUser]);
    
    const [items, setItems] = React.useState<string[]>(() => {
        return currentUser?.dashboardLayouts?.analytics || DEFAULT_ANALYTICS_WIDGETS;
    });
  
    const handleReorder = (newOrder: string[]) => {
        setItems(newOrder);
        updateLayout('analytics', newOrder);
    };
  
    const handleAddWidget = (type: WidgetType) => {
      const newId = `${type}_${Date.now()}`;
      const newItems = [...items, newId];
      setItems(newItems);
      updateLayout('analytics', newItems);
    };
  
    const handleRemoveWidget = (id: string) => {
       if (confirm('Tem certeza que deseja remover este widget?')) {
          const newItems = items.filter(item => item !== id);
          setItems(newItems);
          updateLayout('analytics', newItems);
       }
    };
  
    const renderWidget = (id: string) => {
        let type = id;
        if (id.includes('_')) {
            // Handle cases where suffix might contain underscores? 
            // Our IDs are usually "type_timestamp" or "type_default". 
            // But types like "top_expenses" contain underscores. 
            // Robust fix: We should store type separately or parse carefully. 
            // For now, let's match prefix by known types or splitting.
            // "top_expenses_123" -> type "top_expenses"
            
            // Simple approach: Check against registry keys longest match
            // Or just split by last underscore if we enforce timestamp suffix
            
            const parts = id.split('_');
            // If the last part is numeric timestamp or 'default', pop it.
            const suffix = parts[parts.length-1];
            if (suffix === 'default' || !isNaN(Number(suffix))) {
                type = parts.slice(0, -1).join('_');
            }
        }
  
        switch(type) {
            case 'forecast':
                return <ForecastWidget />;
            case 'history':
                return <MonthlyHistoryWidget />;
            case 'category': 
            case 'category_pie':
                return <CategoryPieWidget />;
            case 'financial_health':
                return <FinancialHealthWidget />;
            case 'top_expenses':
                return <TopExpensesWidget />;
            case 'weekly_spending':
                return <WeeklySpendingWidget />;
            case 'income':
                return <StatCard title="Renda Mensal" value={summary.totalIncome} variant="income" />;
            case 'expense':
                return <StatCard title="Despesas" value={summary.totalExpense} variant="expense" />;
            case 'balance':
                return <StatCard title="Saldo Atual" value={summary.balance} variant="balance" />;
            case 'reservation':
                return <ReservationWidget />;
            default:
                return null;
        }
    };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Analítico</h2>
            <p className="text-gray-500 dark:text-gray-400">Visualize gráficos detalhados. Arraste para organizar.</p>
        </div>
        <WidgetSelector onAdd={handleAddWidget} />
      </div>

      <DraggableGrid 
        items={items}
        onReorder={handleReorder}
        onRemove={handleRemoveWidget}
        renderItem={renderWidget}
        columns={2} // Using 2 columns for larger charts
      />
    </div>
  );
};
