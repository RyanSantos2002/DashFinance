import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Wallet } from 'lucide-react';

export const Login: React.FC = () => {
  const login = useStore((state) => state.login);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-3 rounded-xl mb-4 text-white">
            <Wallet size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DashFinance</h1>
          <p className="text-gray-500 text-center mt-2">
            Digite seu nome para acessar seu painel financeiro pessoal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Seu Nome
            </label>
            <input
              id="name"
              type="text"
              required
              autoFocus
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Ex: Ryan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            Acessar Painel
          </button>
        </form>
      </div>
    </div>
  );
};
