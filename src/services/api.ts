import type { Transaction } from '../types';

// Interface for Data Service
// This abstraction allows us to easy switch from LocalStorage (Zustand) to Supabase later.
export interface IDataService {
    getTransactions(userId: string): Promise<Transaction[]>;
    createTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction>;
    updateTransaction(id: string, updates: Partial<Transaction>): Promise<void>;
    deleteTransaction(id: string): Promise<void>;
}

// Placeholder for Supabase implementation
// export const supabaseService: IDataService = { ... }

// Current "Service" is implicit in Zustand store, but we can extract logic here if needed.
// For now, this file serves as an architectural preparation.
export const api = {
    // Methods to be implemented when connecting to Supabase
    fetchTransactions: async () => {
        // const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId);
        // return data;
        return [];
    }
};
