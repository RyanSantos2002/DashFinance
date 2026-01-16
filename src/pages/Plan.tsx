import React from 'react';
import { Check, Copy, ShieldCheck, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Plan: React.FC = () => {
    const { currentUser } = useStore();
    const trialStart = currentUser?.trialStart ? new Date(currentUser.trialStart) : new Date();
    // Calculate 24h expiration
    const expirationDate = new Date(trialStart.getTime() + 24 * 60 * 60 * 1000);
    const isExpired = new Date() > expirationDate;

    // TODO: Replace with your actual PIX Key
    const pixKey = "00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5913Seu Nome Aqui6008Sao Paulo62070503***63041D3D"; 

    const copyPix = () => {
        navigator.clipboard.writeText(pixKey);
        alert("Chave PIX copiada!");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                
                {/* Left Side: Pitch */}
                <div className="md:w-1/2 p-8 md:p-12 bg-blue-600 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-4">DashFinanceiro <span className="text-blue-200">Pro</span></h1>
                        <p className="text-blue-100 text-lg mb-8">
                            {isExpired 
                                ? "Seu período de teste gratuito de 24 horas encerrou." 
                                : "Aproveite seu período de teste. Libere o acesso vitalício agora!"}
                        </p>
                        
                        <ul className="space-y-4">
                            {[
                                "Acesso Vitalício ao Sistema",
                                "Cotações em Tempo Real",
                                "Gestão de Metas e Orçamento",
                                "Sem mensalidades (Pagamento Único)"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="p-1 bg-blue-500 rounded-full">
                                        <Check size={16} />
                                    </div>
                                    <span className="font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Background decorations */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-700 rounded-full opacity-50 blur-3xl"></div>
                    
                    <div className="mt-8 relative z-10">
                         {!isExpired && (
                            <div className="flex items-center gap-2 p-3 bg-blue-700/50 rounded-lg backdrop-blur-sm">
                                <Clock size={20} className="text-yellow-300" />
                                <span className="text-sm">
                                    Seu teste acaba em: {expirationDate.toLocaleTimeString()} ({expirationDate.toLocaleDateString()})
                                </span>
                            </div>
                         )}
                    </div>
                </div>

                {/* Right Side: Payment */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center">
                    <ShieldCheck size={48} className="text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Desbloqueie Agora</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Faça um PIX de <span className="font-bold text-gray-900 dark:text-white text-lg">R$ 25,00</span> para liberar seu acesso imediatamente.
                    </p>

                    <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl mb-6 w-full max-w-xs">
                        {/* QR Code Placeholder - You can generate a real one at https://www.gerarpix.com.br/ and put the image here */}
                         <div className="aspect-square bg-white flex items-center justify-center rounded-lg mb-4 border-2 border-dashed border-gray-300">
                             <p className="text-xs text-gray-400">QR Code do PIX</p>
                             {/* <img src="/path/to/qrcode.png" alt="QR Code" /> */}
                         </div>
                         
                         <p className="text-xs text-gray-500 break-all mb-2 font-mono">{pixKey.substring(0, 20)}...</p>
                         
                         <button 
                            onClick={copyPix}
                            className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2 rounded-lg transition-colors text-sm font-medium"
                         >
                             <Copy size={16} />
                             Copiar Chave Pix
                         </button>
                    </div>

                    <div className="text-left text-sm text-gray-500 dark:text-gray-400 space-y-2 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                        <p className="font-bold text-yellow-700 dark:text-yellow-500">Como ativar?</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Faça o pagamento via PIX.</li>
                            <li>Envie o comprovante para o suporte.</li>
                            <li>Aguarde a liberação (geralmente em minutos).</li>
                        </ol>
                    </div>

                    <a href="https://wa.me/55SEUNUMERO" target="_blank" rel="noreferrer" className="mt-8 text-blue-600 hover:underline text-sm font-medium">
                        Falar com Suporte / Enviar Comprovante
                    </a>
                </div>
            </div>
        </div>
    );
};
