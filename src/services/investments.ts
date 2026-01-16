import { supabase } from '../lib/supabase';
import type { Investment } from '../types';

export const investmentService = {
  async fetchInvestments(userId: string) {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        name: item.name,
        type: item.type,
        amountInvested: Number(item.amount_invested),
        currentValue: Number(item.current_value),
        quantity: Number(item.quantity),
        date: item.created_at
    }));
  },

  async addInvestment(investment: Omit<Investment, 'id'>) {
    const { data, error } = await supabase
      .from('investments')
      .insert([{
        user_id: investment.userId,
        name: investment.name,
        type: investment.type,
        amount_invested: investment.amountInvested,
        current_value: investment.currentValue,
        quantity: investment.quantity
      }])
      .select()
      .single();

    if (error) throw error;

    return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        type: data.type,
        amountInvested: Number(data.amount_invested),
        currentValue: Number(data.current_value),
        quantity: Number(data.quantity),
        date: data.created_at
    };
  },

  async removeInvestment(id: string) {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  
  async updateInvestment(id: string, updates: Partial<Investment>) {
     // Map frontend keys to DB keys
     const dbUpdates: Record<string, any> = {};
     if (updates.name) dbUpdates.name = updates.name;
     if (updates.type) dbUpdates.type = updates.type;
     if (updates.amountInvested !== undefined) dbUpdates.amount_invested = updates.amountInvested;
     if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;
     if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;

     const { error } = await supabase
        .from('investments')
        .update(dbUpdates)
        .eq('id', id);
        
     if (error) throw error;
  }
};
