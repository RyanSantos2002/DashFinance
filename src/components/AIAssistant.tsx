import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bot, X, Send, Sparkles, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '../store/useStore';
import { type Category } from '../types';
import { analyzeFinancesLocal, generateAIResponse, type AIResponse, type AIRiskAssessment, type AIAction } from '../services/aiService';

export const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
        { role: 'ai', content: "Olá! Sou seu assistente financeiro. Como posso ajudar com seu dinheiro hoje?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTip, setShowTip] = useState(true);
    const [aiRisk, setAiRisk] = useState<AIRiskAssessment | null>(null);
    const [pendingAction, setPendingAction] = useState<AIAction | null>(null);
    
    // Get store data for context
    const { transactions, currentUser, addTransaction } = useStore();
    const apiKey = localStorage.getItem('gemini_api_key');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Calculate balance for the assistant
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, pendingAction]);

    // Initial Analysis (Local Heuristics) - Memoized to prevent re-renders
    const localTips = useMemo(() => {
        if (transactions.length > 0) {
            return analyzeFinancesLocal(transactions, balance);
        }
        return [];
    }, [transactions, balance]);


    // Determine what to show in the bubble (AI takes precedence)
    const activeTip = aiRisk ? aiRisk.message : localTips[0];
    const isRiskHigh = aiRisk?.riskLevel === 'high';

    // Auto-dismiss bubble after 8 seconds
    useEffect(() => {
        if (showTip && activeTip) {
            const timer = setTimeout(() => {
                setShowTip(false);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [showTip, activeTip]);

    // Continuous Monitoring: Trigger AI on significant changes (e.g. new transaction)
    // We use a ref to track previous length to detect additions
    const prevTxLength = useRef(transactions.length);

    useEffect(() => {
        // Debounce to prevent rapid triggers
        const timeoutId = setTimeout(() => {
            const checkFinancialHealth = async () => {
                // STRICT CHECK: Only trigger if exactly ONE transaction was added.
                // This prevents triggers on:
                // 1. Initial hydration (0 -> N)
                // 2. Bulk imports
                // 3. Removals
                if (transactions.length === prevTxLength.current + 1 && !isLoading) {
                    const firstName = currentUser?.name.split(' ')[0] || 'Usuário';
                    const context = { transactions, balance };
                    
                    try {
                        const response = await generateAIResponse(apiKey || '', "Verifique se essa nova transação afeta meu saldo futuro.", context, firstName);
                        
                        if (response.riskAssessment) {
                            setAiRisk(response.riskAssessment);
                            setShowTip(true); 
                        }
                    } catch (e) {
                        console.error("Erro no monitoramento automático", e);
                    }
                }
                prevTxLength.current = transactions.length;
            };

            checkFinancialHealth();
        }, 2000); // Wait 2s to ensure state is stable

        return () => clearTimeout(timeoutId);
    }, [transactions, balance, apiKey, currentUser, isLoading]);


    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setPendingAction(null); // Clear any previous pending action

        const firstName = currentUser?.name.split(' ')[0] || 'Usuário';

        // Context for AI
        const context = {
            transactions,
            balance
        };

        try {
            const response: AIResponse = await generateAIResponse(apiKey || '', userMessage, context, firstName);

            // Handle AI Actions - NOW WITH CONFIRMATION
            if (response.action && response.action.type !== 'none' && response.action.data) {
                setPendingAction(response.action);
            }

            // Handle Risk Assessment
            if (response.riskAssessment) {
                setAiRisk(response.riskAssessment);
                setShowTip(true); // Re-open bubble if new insight
            }

            setMessages(prev => [...prev, { role: 'ai', content: response.message }]);
        } catch (error) {
            console.error("Erro processando IA", error);
             setMessages(prev => [...prev, { role: 'ai', content: "Desculpe, tive um erro interno." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmAction = async () => {
        if (!pendingAction || !pendingAction.data) return;

        const { type, data } = pendingAction;
        try {
            if (type === 'add_expense' || type === 'add_transaction') {
                await addTransaction({
                    description: data.description || 'Despesa via IA',
                    amount: data.amount || 0,
                    type: 'expense',
                    category: (data.category || 'Outros') as Category,
                    date: data.date || new Date().toISOString(),
                    isFixed: false
                });
            } else if (type === 'add_income') {
                    await addTransaction({
                    description: data.description || 'Receita via IA',
                    amount: data.amount || 0,
                    type: 'income',
                    category: (data.category || 'Outros') as Category,
                    date: data.date || new Date().toISOString(),
                    isFixed: false
                });
            }
            setMessages(prev => [...prev, { role: 'ai', content: "✅ Feito! Transação adicionada." }]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', content: "❌ Erro ao adicionar transação." }]);
        } finally {
            setPendingAction(null);
        }
    };

    const handleCancelAction = () => {
        setPendingAction(null);
        setMessages(prev => [...prev, { role: 'ai', content: "👍 Cancelado. Algo mais?" }]);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!currentUser) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Proactive Tip Bubble */}
            {showTip && (aiRisk || localTips.length > 0) && !isOpen && (
                <div className={`mb-4 bg-white p-4 rounded-2xl shadow-xl border ${isRiskHigh ? 'border-red-200 bg-red-50' : 'border-blue-100'} max-w-xs animate-fade-in-up pointer-events-auto relative`}>
                    <button 
                        onClick={() => setShowTip(false)} 
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={14} />
                    </button>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isRiskHigh ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {isRiskHigh ? <AlertTriangle size={18} /> : <Sparkles size={18} />}
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isRiskHigh ? 'text-red-700' : 'text-gray-700'}`}>
                                {isRiskHigh ? 'Alerta de Risco' : 'Dica Inteligente'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{activeTip}</p>
                            <button 
                                onClick={() => setIsOpen(true)}
                                className="text-xs text-blue-600 font-medium mt-2 hover:underline"
                            >
                                Conversar sobre isso
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col max-h-[500px] border border-gray-200 pointer-events-auto overflow-hidden transition-all origin-bottom-right">
                    {/* Check for API Key */}
                    {!apiKey && (
                        <div className="bg-yellow-50 text-yellow-800 text-xs p-2 text-center border-b border-yellow-100">
                             ⚠️ Modo Offline (Básico). Configure sua API Key para inteligência real.
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">RoboFin</h3>
                                <p className="text-xs text-blue-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, idx) => (
                            <div 
                                key={idx} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`
                                        max-w-[85%] rounded-2xl p-3 text-sm shadow-sm
                                        ${msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                        }
                                    `}
                                >
                                    {msg.role === 'ai' ? (
                                         <ReactMarkdown 
                                            components={{
                                                p: ({...props}) => <p className="mb-1 last:mb-0" {...props} />,
                                                strong: ({...props}) => <span className="font-semibold" {...props} />,
                                                ul: ({...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                li: ({...props}) => <li className="mb-0.5" {...props} />
                                            }}
                                         >
                                            {msg.content}
                                         </ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* Pending Action Confirmation Card */}
                        {pendingAction && (
                            <div className="flex justify-start animate-fade-in-up">
                                <div className="bg-white border-l-4 border-blue-500 rounded-r-xl shadow-md p-4 max-w-[90%] w-full">
                                    <h4 className="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2">
                                        <Sparkles size={16} className="text-blue-500" />
                                        Confirmação Necessária
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Deseja adicionar a transação:
                                    </p>
                                    <div className="mb-3 bg-gray-50 p-2 rounded text-xs text-gray-700">
                                        <div className="flex justify-between">
                                            <span>Descrição:</span>
                                            <strong>{pendingAction.data?.description || 'N/A'}</strong>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span>Valor:</span>
                                            <strong>R$ {pendingAction.data?.amount?.toFixed(2)}</strong>
                                        </div>
                                         <div className="flex justify-between mt-1">
                                            <span>Categoria:</span>
                                            <strong>{pendingAction.data?.category || 'Outros'}</strong>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleConfirmAction}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors shadow-sm"
                                        >
                                            <ThumbsUp size={14} />
                                            Confirmar
                                        </button>
                                        <button 
                                            onClick={handleCancelAction}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                                        >
                                            <ThumbsDown size={14} />
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Digite sua dúvida..."
                                className="w-full pl-4 pr-10 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-gray-700 placeholder:text-gray-400"
                                disabled={isLoading || !!pendingAction} // Disable input while pending action
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading || !!pendingAction}
                                className="absolute right-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    pointer-events-auto
                    w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300
                    hover:scale-105 active:scale-95
                    ${isOpen 
                        ? 'bg-gray-200 text-gray-600 rotate-90' 
                        : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                    }
                `}
            >
                {isOpen ? <X size={24} /> : (
                    <div className="relative">
                        <Bot size={28} />
                        {activeTip && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRiskHigh ? 'bg-red-400' : 'bg-blue-400'} opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isRiskHigh ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                            </span>
                        )}
                    </div>
                )}
            </button>
        </div>
    );
};
