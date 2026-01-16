import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type FinancialState, type Transaction, type User, type Investment } from '../types';
import { transactionService } from '../services/transactions';
import { investmentService } from '../services/investments';

interface FinancialStore extends FinancialState {
    setCurrentUser: (user: User | null) => void;
    fetchTransactions: () => Promise<void>;
    updateProfile: (updates: { name?: string; avatar?: string }) => Promise<void>;
    setFixedSalary: (amount: number) => Promise<void>;
    
    // Investments
    investments: Investment[];
    fetchInvestments: () => Promise<void>;
    addInvestment: (investment: Omit<Investment, 'id' | 'userId'>) => Promise<void>;
    removeInvestment: (id: string) => Promise<void>;

    // Loading States
    isTransactionsLoading: boolean;
    isProfileLoading: boolean;
    isInvestmentsLoading: boolean;
}

export const useStore = create<FinancialStore>()(
    persist(
        (set, get) => ({
            transactions: [],
            investments: [],
            currentUser: null,
            theme: 'light', 
            selectedDate: new Date().toISOString(),
            reservationBalance: 0,
            
            // Initial Loading States
            isTransactionsLoading: false,
            isProfileLoading: false,
            isInvestmentsLoading: false,

            login: () => {}, 
            logout: async () => {
                const { supabase } = await import('../lib/supabase');
                await supabase.auth.signOut();
                set({ currentUser: null, transactions: [] });
            },
            
            setCurrentUser: (user) => set({ currentUser: user }),

            setSelectedDate: (date) => set({ selectedDate: date }),
            
            toggleTheme: () => set((state) => {
                const newTheme = state.theme === 'light' ? 'dark' : 'light';
                // Side effect is handled by Layout effect, but keeping it for immediate feeling
                if (typeof window !== 'undefined') {
                    if (newTheme === 'dark') document.documentElement.classList.add('dark');
                    else document.documentElement.classList.remove('dark');
                }
                return { theme: newTheme };
            }),

            // Sync with DB
            fetchTransactions: async () => {
                const user = get().currentUser;
                if (!user) return;
                
                set({ isTransactionsLoading: true });
                
                try {
                    const data = await transactionService.fetchTransactions(user.id);
                    set({ transactions: data });
                } catch (error) {
                    console.error(error);
                } finally {
                    set({ isTransactionsLoading: false });
                }
            },

            addTransaction: async (transaction) => {
                const user = get().currentUser;
                if (!user) return;
                
                // Optimistic update
                const tempId =  crypto.randomUUID();
                const newTx: Transaction = { ...transaction, id: tempId, userId: user.id };
                
                set((state) => ({ transactions: [newTx, ...state.transactions] }));

                try {
                    // DB Sync
                    const savedTx = await transactionService.addTransaction({ ...transaction, userId: user.id});
                    // Replace temp with real
                    set((state) => ({
                        transactions: state.transactions.map(t => t.id === tempId ? savedTx : t)
                    }));
                } catch (error) {
                    console.error("Failed to save transaction", error);
                    // Rollback
                    set((state) => ({ transactions: state.transactions.filter(t => t.id !== tempId) }));
                }
            },

            removeTransaction: async (id) => {
                const prev = get().transactions;
                set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
                
                try {
                    await transactionService.removeTransaction(id);
                } catch (error) {
                    console.error("Failed to delete", error);
                    set({ transactions: prev }); // Rollback
                }
            },

            editTransaction: (id, updated) => {
                // TODO: Implement update in service
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, ...updated } : t
                    ),
                }));
            },

            addToReservation: (amount) => set((state) => ({ reservationBalance: (state.reservationBalance || 0) + amount })),
            
            updateLayout: (page, layout) => set((state) => {
                if (!state.currentUser) return state;
                const layouts = state.currentUser.dashboardLayouts || { principal: [], analytics: [] };
                // Ideally save to DB profile here
                return {
                    currentUser: {
                        ...state.currentUser,
                        dashboardLayouts: {
                            ...layouts,
                            [page]: layout
                        }
                    }
                };
            }),

            updateProfile: async ({ name, avatar }) => {
                const { currentUser } = get();
                if (!currentUser) return;
                
                try {
                    set({ isProfileLoading: true });
                    
                    // Call Supabase to update profile
                    const { supabase } = await import('../lib/supabase');
                    const updates: { updated_at: string; full_name?: string; avatar_url?: string } = { 
                        updated_at: new Date().toISOString() 
                    };
                    if (name) updates.full_name = name;
                    if (avatar) updates.avatar_url = avatar;

                    const { error } = await supabase
                        .from('profiles')
                        .update(updates)
                        .eq('id', currentUser.id);

                    if (error) throw error;
                    
                    // Update local state
                    set((state) => ({
                        currentUser: state.currentUser ? { 
                            ...state.currentUser, 
                            name: name || state.currentUser.name,
                            avatar: avatar || state.currentUser.avatar
                        } : null,
                        isProfileLoading: false
                    }));
                } catch (error) {
                    console.error('Error updating profile:', error);
                    set({ isProfileLoading: false });
                    throw error;
                }
            },

            setFixedSalary: async (amount) => {
                const { currentUser, transactions } = get();
                if (!currentUser) return;

                // 1. Identify ALL existing fixed salary transactions to clean up duplicates
                const existingSalaries = transactions.filter(t => 
                    t.type === 'income' && 
                    t.isFixed && 
                    t.description === 'Salário Mensal'
                );

                // 2. Remove them from local state immediately (optimistic cleanup)
                if (existingSalaries.length > 0) {
                    set((state) => ({
                        transactions: state.transactions.filter(t => 
                            !(t.type === 'income' && t.isFixed && t.description === 'Salário Mensal')
                        )
                    }));

                    // 3. Remove from DB in background
                    existingSalaries.forEach(async (t) => {
                        try {
                            await transactionService.removeTransaction(t.id);
                        } catch (e) {
                            console.error('Failed to cleanup old salary', e);
                        }
                    });
                }

                // 3. If amount > 0, add the new salary
                if (amount > 0) {
                     const newTx: Omit<Transaction, 'id' | 'userId'> = {
                        description: 'Salário Mensal',
                        amount: amount,
                        type: 'income',
                        category: 'Salário',
                        date: new Date().toISOString(),
                        isFixed: true,
                        installment: undefined
                    };
                    // Use internal helper or just call the action
                    get().addTransaction(newTx);
                }
            },

            // Investments Actions
            fetchInvestments: async () => {
                const user = get().currentUser;
                if (!user) return;
                try { 
                    const data = await investmentService.fetchInvestments(user.id);
                    set({ investments: data });
                } catch (error) {
                    console.error('Fetch investments error:', error);
                }
            },

            addInvestment: async (investment) => {
                const user = get().currentUser;
                if (!user) return;
                set({ isInvestmentsLoading: true });
                try {
                     // Optimistic
                    const tempId = crypto.randomUUID();
                    const newInv: Investment = { ...investment, id: tempId, userId: user.id, date: new Date().toISOString() };
                    set(state => ({ investments: [newInv, ...state.investments] }));

                    // DB
                    const saved = await investmentService.addInvestment({ ...investment, userId: user.id });
                    set(state => ({ 
                        investments: state.investments.map(i => i.id === tempId ? saved : i),
                        isInvestmentsLoading: false
                    }));
                } catch (error) {
                    console.error(error);
                    set({ isInvestmentsLoading: false });
                    // Should revert logic here ideally
                }
            },

            removeInvestment: async (id) => {
                 const prev = get().investments;
                 set(state => ({ investments: state.investments.filter(i => i.id !== id) }));
                 try {
                     await investmentService.removeInvestment(id);
                 } catch (error) {
                     console.error(error);
                     set({ investments: prev });
                 }
            },

            getSummary: () => {
                const { transactions, selectedDate, reservationBalance } = get();
                const year = new Date(selectedDate).getFullYear();
                const month = new Date(selectedDate).getMonth();

                const filtered = transactions.filter((t) => {
                    const d = new Date(t.date);
                    return d.getFullYear() === year && d.getMonth() === month;
                });

                const totalIncome = filtered
                    .filter((t) => t.type === 'income')
                    .reduce((acc, curr) => acc + curr.amount, 0);

                const totalExpense = filtered
                    .filter((t) => t.type === 'expense')
                    .reduce((acc, curr) => acc + curr.amount, 0);

                return {
                    totalIncome,
                    totalExpense,
                    balance: totalIncome - totalExpense,
                    reservation: reservationBalance || 0
                };
            },
        }),
        {
            name: 'dashfinance-storage',
            partialize: (state) => ({ theme: state.theme }), // Only persist theme
        }
    )
);
