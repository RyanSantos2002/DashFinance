export type TransactionType = 'income' | 'expense';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
}

export type Category = 
  | 'Alimentação'
  | 'Moradia'
  | 'Transporte'
  | 'Lazer'
  | 'Saúde'
  | 'Educação'
  | 'Outros';

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
  theme: Theme;
  selectedDate: string; // ISO string for month selection (e.g. 2024-01-01)
  login: (name: string) => void;
  logout: () => void;
  setSelectedDate: (date: string) => void;
  toggleTheme: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  removeTransaction: (id: string) => void;
  editTransaction: (id: string, updated: Partial<Transaction>) => void;
  getSummary: () => {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
}
