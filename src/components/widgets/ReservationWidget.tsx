import React from 'react';
import { PiggyBank } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/format';
import { useStore } from '../../store/useStore';

export const ReservationWidget: React.FC = () => {
    const { reservationBalance, addToReservation } = useStore();

    const handleAddReservation = () => {
        const input = window.prompt("Quanto você quer guardar na reserva?");
        if (!input) return;
        
        const value = parseFloat(input.replace(',', '.'));
        if (isNaN(value) || value <= 0) {
          alert("Por favor, insira um valor válido.");
          return;
        }
        
        addToReservation(value);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between transition-colors group relative h-full">
            <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reserva Acumulada</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(reservationBalance || 0)}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Total guardado</p>
            </div>
            <div className={cn("p-3 rounded-full bg-purple-50 text-purple-600")}>
            <PiggyBank size={24} />
            </div>
            
            {/* Quick Add Button */}
            <button 
            onClick={handleAddReservation}
            className="absolute bottom-4 right-4 bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
            title="Adicionar à reserva"
            // Stop drag event propagation if needed, though dnd-kit usually handles handles explicitly
            onPointerDown={(e) => e.stopPropagation()} 
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
        </div>
    );
}
