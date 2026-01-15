import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FinancialState, Transaction } from '../types';

export const useStore = create<FinancialState>()(
  persist(
    (set, get) => ({
      transactions: [],
      currentUser: null,
      theme: 'light',
      selectedDate: new Date().toISOString(),
      
      login: (name) => {
        // Simple "login" - generates a stable ID based on name or just random if not strict
        // For simplicity reusing name as ID prefix or just simple object hash in real app
        // Here we just mock an ID based on name for persistence across reload if name matches
        const id = btoa(name.toLowerCase()); 
        set({ currentUser: { id, name } });
      },

      logout: () => set({ currentUser: null }),
      
      setSelectedDate: (date) => set({ selectedDate: date }),

      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      addTransaction: (transaction) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const newTransaction: Transaction = {
          ...transaction,
          id: crypto.randomUUID(),
          userId: currentUser.id,
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      editTransaction: (id, updated) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updated } : t
          ),
        }));
      },

      getSummary: () => {
        const { transactions, currentUser, selectedDate } = get();
        // Filter transactions for current user AND selected month
        const targetDate = new Date(selectedDate);
        
        const userTransactions = transactions.filter(t => {
            if (t.userId !== currentUser?.id) return false;
            
            // Allow fixed expenses OR matching month/year
            // For summary we generally want "what happened in this month"
            // So: Fixed expenses (active) + Variable/Installments in this month
            const tDate = new Date(t.date);
            const isSameMonth = tDate.getMonth() === targetDate.getMonth() && 
                                tDate.getFullYear() === targetDate.getFullYear();
            
            if (t.isFixed && t.type === 'expense') return true; // Fixed counts every month
            return isSameMonth;
        });

        const totalIncome = userTransactions
          .filter((t) => t.type === 'income')
          .reduce((acc, t) => acc + t.amount, 0);
        
        const totalExpense = userTransactions
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0);

        return {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
        };
      },
    }),
    {
      name: 'financial-storage',
    }
  )
);
