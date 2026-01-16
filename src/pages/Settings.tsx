import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { User, DollarSign, Moon, Sun, Save, Camera } from 'lucide-react';

export const Settings: React.FC = () => {
    const { currentUser, theme, toggleTheme, transactions, updateProfile, setFixedSalary } = useStore();
    
    // Local state for forms
    const [name, setName] = useState(currentUser?.name || '');
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '');
    const [salary, setSalary] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // Initialize salary from existing fixed transaction
    useEffect(() => {
        const salaryTx = transactions.find(t => t.description === 'Salário Mensal' && t.isFixed);
        if (salaryTx) {
            setSalary(salaryTx.amount.toString());
        }
    }, [transactions]);

    // File upload handler
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${currentUser?.id}/${fileName}`;

        setLoading(true);
        setMessage(null);

        try {
            const { supabase } = await import('../lib/supabase');
            
            // Upload
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            
            setAvatarUrl(data.publicUrl);
            setMessage({ type: 'success', text: 'Foto carregada! Clique em Salvar Perfil.' });
        } catch (error) {
            console.error('Upload Error:', error);
            setMessage({ type: 'error', text: 'Erro no upload. Verifique se criou o bucket "avatars" no Supabase.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await updateProfile({ name, avatar: avatarUrl });
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch {
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSalary = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const amount = parseFloat(salary);
            if (isNaN(amount)) throw new Error('Valor inválido');
            
            await setFixedSalary(amount);
            setMessage({ type: 'success', text: 'Salário fixo atualizado!' });
        } catch {
             setMessage({ type: 'error', text: 'Erro ao salvar salário.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configurações</h2>
                <p className="text-gray-500 dark:text-gray-400">Gerencie sua conta e preferências.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {message.text}
                </div>
            )}

            {/* Profile Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Perfil</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Seus dados pessoais</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col items-center sm:flex-row gap-6 mb-4">
                         <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-gray-400" />
                                )}
                            </div>
                            <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="text-white" size={24} />
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                            </label>
                         </div>
                         <div className="flex-1 w-full">
                            <p className="font-medium text-gray-900 dark:text-white mb-2">Sua Foto</p>
                            <p className="text-xs text-gray-500 mb-2">Clique na imagem para alterar.</p>
                            {/* Hidden URL input fallback or debug */}
                            <input 
                                type="text" 
                                value={avatarUrl}
                                readOnly
                                className="w-full p-2 text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400 font-mono"
                                placeholder="URL da imagem..."
                            />
                         </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome Completo
                        </label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all"
                        />
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        Salvar Perfil
                    </button>
                </div>
            </div>

            {/* Financial Config */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Financeiro</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Configurações de renda</p>
                    </div>
                </div>

                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Salário Fixo Mensal
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                            <input 
                                type="number" 
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                placeholder="0,00"
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Este valor será lançado automaticamente todo mês como Receita Fixa.</p>
                    </div>

                    <button 
                        onClick={handleSaveSalary}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        Atualizar Salário
                    </button>
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600">
                            {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Aparência</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {theme === 'light' ? 'Modo Claro ativado' : 'Modo Escuro ativado'}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={toggleTheme}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Trocar Tema
                    </button>
                 </div>
            </div>
        </div>
    );
};
