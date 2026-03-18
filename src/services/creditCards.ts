import { supabase } from '../lib/supabase';
import { type CreditCard } from '../types';

export const creditCardService = {
    async fetchCreditCards(userId: string): Promise<CreditCard[]> {
        const { data, error } = await supabase
            .from('credit_cards')
            .select('*')
            .eq('user_id', userId)
            .order('name', { ascending: true });

        if (error) throw error;
        
        return data.map(dbItem => ({
            id: dbItem.id,
            userId: dbItem.user_id,
            name: dbItem.name,
            limit: Number(dbItem.limit),
            closingDay: dbItem.closing_day,
            dueDay: dbItem.due_day,
            color: dbItem.color
        }));
    },

    async addCreditCard(card: Omit<CreditCard, 'id'>) {
        const { data, error } = await supabase
            .from('credit_cards')
            .insert({
                user_id: card.userId,
                name: card.name,
                limit: card.limit,
                closing_day: card.closingDay,
                due_day: card.dueDay,
                color: card.color
            })
            .select()
            .single();

        if (error) throw error;
        
        return {
            ...card,
            id: data.id
        };
    },

    async removeCreditCard(id: string) {
        const { error } = await supabase
            .from('credit_cards')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
