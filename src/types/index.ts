export type TransactionType = 'income' | 'expense';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  dashboardLayouts?: {
    principal: string[];
    analytics: string[];
  };
  isPremium?: boolean;
  trialStart?: string;
}

export type Category = 
  | 'Salário'
  | 'Alimentação'
  | 'Moradia'
  | 'Transporte'
  | 'Lazer'
  | 'Saúde'
  | 'Educação'
  | 'Outros';

export type InvestmentType = 'Ações' | 'FIIs' | 'Renda Fixa' | 'Crypto' | 'Fundos' | 'Outros';

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  amountInvested: number;
  currentValue: number;
  quantity: number;
  date: string; // created_at
}

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO string
  isFixed?: boolean;
  installment?: {
    current: number;
    total: number;
  };
}

export interface FinancialState {
  transactions: Transaction[];
  currentUser: User | null;
  theme: 'light' | 'dark';
  selectedDate: string; // ISO string
  reservationBalance: number; // for month selection (e.g. 2024-01-01)
  login: (name: string) => void;
  logout: () => void;
  setSelectedDate: (date: string) => void;
  toggleTheme: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  addToReservation: (amount: number) => void;
  updateLayout: (page: 'principal' | 'analytics', layout: string[]) => void;
  removeTransaction: (id: string) => void;
  editTransaction: (id: string, updated: Partial<Transaction>) => void;
  getSummary: () => {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    reservation: number;
  };
}
