import { supabase } from '../lib/supabase';
import { type Transaction } from '../types';

export const transactionService = {
    async fetchTransactions(userId: string): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) throw error;
        
        return data.map(dbItem => ({
            id: dbItem.id,
            userId: dbItem.user_id,
            description: dbItem.description,
            amount: Number(dbItem.amount),
            type: dbItem.type as 'income' | 'expense',
            category: dbItem.category as Transaction['category'],
            date: dbItem.date,
            isFixed: dbItem.is_fixed,
            installment: dbItem.installment,
            paymentMethod: dbItem.payment_method,
            creditCardId: dbItem.credit_card_id
        }));
    },

    async addTransaction(transaction: Omit<Transaction, 'id'>) {
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                user_id: transaction.userId,
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                date: transaction.date,
                is_fixed: transaction.isFixed,
                installment: transaction.installment,
                payment_method: transaction.paymentMethod,
                credit_card_id: transaction.creditCardId
            })
            .select()
            .single();

        if (error) throw error;
        
        return {
            ...transaction,
            id: data.id
        };
    },

    async removeTransaction(id: string) {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async updateTransaction(id: string, updates: Partial<Transaction>) {
        const dbUpdates: any = {};
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.amount !== undefined) dbUpdates.amount = Number(updates.amount);
        if (updates.type) dbUpdates.type = updates.type;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.date) dbUpdates.date = updates.date;
        if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
        if (updates.creditCardId !== undefined) dbUpdates.credit_card_id = updates.creditCardId;
        if (updates.isFixed !== undefined) dbUpdates.is_fixed = updates.isFixed;

        const { error } = await supabase
            .from('transactions')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    }
};
