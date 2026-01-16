import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { TransactionForm } from './TransactionForm';

export const QuickActions: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-blue-200"
            >
                <Plus size={20} />
                <span>Nova Transação</span>
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Adicionar Transação</h2>
                            <TransactionForm onSuccess={() => setIsModalOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
