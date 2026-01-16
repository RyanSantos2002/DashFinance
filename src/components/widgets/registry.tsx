import React from 'react';
import { PieChart, TrendingUp, Calendar, ArrowUpCircle, ArrowDownCircle, DollarSign, PiggyBank, Activity, ListOrdered, BarChart2 } from 'lucide-react';

export type WidgetType = 
  | 'income' 
  | 'expense' 
  | 'balance' 
  | 'reservation' 
  | 'forecast' 
  | 'history' 
  | 'category_pie'
  | 'top_expenses'
  | 'financial_health'
  | 'weekly_spending';

export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  description: string;
  icon: React.ElementType;
  defaultColSpan: number; // 1 to 4 (grid columns)
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  income: {
    type: 'income',
    label: 'Renda Mensal',
    description: 'Card com o total de entradas do mês.',
    icon: ArrowUpCircle,
    defaultColSpan: 1
  },
  expense: {
    type: 'expense',
    label: 'Despesas',
    description: 'Card com o total de saídas do mês.',
    icon: ArrowDownCircle,
    defaultColSpan: 1
  },
  balance: {
    type: 'balance',
    label: 'Saldo',
    description: 'Card com o saldo atual.',
    icon: DollarSign,
    defaultColSpan: 1
  },
  reservation: {
    type: 'reservation',
    label: 'Reserva',
    description: 'Card interativo de reserva financeira.',
    icon: PiggyBank,
    defaultColSpan: 1
  },
  financial_health: {
    type: 'financial_health',
    label: 'Saúde Financeira',
    description: 'Score de saúde baseado em poupança.',
    icon: Activity,
    defaultColSpan: 1
  },
  top_expenses: {
    type: 'top_expenses',
    label: 'Top 5 Gastos',
    description: 'Ranking das maiores despesas do mês.',
    icon: ListOrdered,
    defaultColSpan: 1
  },
  category_pie: {
    type: 'category_pie',
    label: 'Gastos por Categoria',
    description: 'Gráfico de pizza com distribuição de gastos.',
    icon: PieChart,
    defaultColSpan: 2
  },
  weekly_spending: {
    type: 'weekly_spending',
    label: 'Gastos por Dia',
    description: 'Análise de gastos por dia da semana.',
    icon: BarChart2,
    defaultColSpan: 2
  },
  history: {
    type: 'history',
    label: 'Histórico Mensal',
    description: 'Gráfico de barras com evolução mensal.',
    icon: TrendingUp,
    defaultColSpan: 2
  },
  forecast: {
    type: 'forecast',
    label: 'Previsão Futura',
    description: 'Tabela com projeção de gastos futuros.',
    icon: Calendar,
    defaultColSpan: 2 
  }
};
