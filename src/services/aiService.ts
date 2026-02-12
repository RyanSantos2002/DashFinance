import { GoogleGenerativeAI } from "@google/generative-ai";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

// Module-level Singleton
let genAIInstance: GoogleGenerativeAI | null = null;
let lastApiKey: string = '';

// --- Helpers ---

export const analyzeFinancesLocal = (transactions: Transaction[], balance: number) => {
  const tips: string[] = [];
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  
  const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);

  // 1. Alert: High Spending Ratio
  if (totalExpenses > totalIncome * 0.9 && totalIncome > 0) {
    tips.push("⚠️ Cuidado! Você já gastou mais de 90% do que ganhou.");
  }

  // 2. Alert: Negative Balance
  if (balance < 0) {
    tips.push("🚨 Sua conta está no negativo. Evite novos gastos não essenciais.");
  }

  // 3. Tip: Identify highest category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0) {
    const [topCategory, amount] = sortedCategories[0];
    tips.push(`💡 Seu maior gasto é com **${topCategory}** (R$ ${amount.toFixed(2)}). Tente reduzir aqui.`);
  }

  return tips;
};

const cleanAIResponse = (text: string): string => {
  return text
    .trim()
    .replace(/```json/g, "")
    .replace(/```/g, "");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isValidAIResponse = (data: any): data is AIResponse => {
  // 1. Basic Object Check
  if (typeof data !== 'object' || data === null) return false;
  
  // 2. Message Check
  if (typeof data.message !== 'string') return false;

  // 3. Risk Assessment Check
  if (
    !data.riskAssessment ||
    typeof data.riskAssessment !== 'object' ||
    typeof data.riskAssessment.message !== 'string' ||
    !["low", "medium", "high"].includes(data.riskAssessment.riskLevel)
  ) {
    return false;
  }

  // 4. Action Check (Optional but strict if present)
  if (data.action) {
    if (typeof data.action !== 'object') return false;
    if (
        !['add_expense', 'add_income', 'add_transaction', 'remove_transaction', 'none'].includes(data.action.type)
    ) {
        return false;
    }
  }

  return true;
};

const buildPrompt = (userName: string, summary: string, userMessage: string): string => {
  const today = new Date().toISOString().split('T')[0];
  return `
    Você é o "RoboFin", um assistente financeiro pessoal inteligente e proativo.
    
    SEU OBJETIVO:
    1. Responder o usuário com conselhos ou respostas amigáveis, SEMPRE chamando-o pelo nome "${userName}".
    2. IDENTIFICAR se o usuário quer adicionar uma transação (despesa ou receita) e estruturar isso.
    3. AVALIAR o risco financeiro atual do usuário. Se uma nova transação for adicionada, analise se ela compromete o saldo.

    DADOS DO USUÁRIO:
    ${summary}

    PERGUNTA OU AÇÃO DO USUÁRIO: "${userMessage}"

    SAÍDA OBRIGATÓRIA:
    Você DEVE responder APENAS um objeto JSON válido, sem markdown, com a seguinte estrutura:
    {
      "message": "Sua resposta textual aqui (use emojis, seja breve e cordial com ${userName})",
      "action": {
        "type": "add_expense" | "add_income" | "none",
        "data": {
          "description": "Ex: McDonald's",
          "amount": 50.00, 
          "category": "Alimentação | Lazer | Casa | Transporte | Salário | Investimento | Outros",
          "date": "YYYY-MM-DD" (use a data de hoje ${today} se não especificado)
        }
      },
      "riskAssessment": {
        "riskLevel": "high" | "medium" | "low",
        "message": "Um alerta curto (max 10 palavras) ou dica baseada no saldo e impacto da nova transação."
      },
      "confidence": 0.0 a 1.0 (seu grau de certeza sobre a ação a ser tomada)
    }

    REGRAS:
    - Se o usuário falar "gastei 50 no mercado", action.type = "add_expense".
    - Se o usuário falar "recebi 1000", action.type = "add_income".
    - Se o saldo for negativo ou a nova despesa deixar negativo, riskLevel = "high".
    - Se o usuário apenas cumprimentar, riskAssessment deve ser uma saudação curta ou dica genérica.

    IMPORTANTE:
    - NÃO use markdown
    - NÃO use crases
    - NÃO escreva texto fora do JSON
    - Retorne SOMENTE o objeto JSON
  `;
};

// --- Types ---

export interface AIAction {
  type: 'add_transaction' | 'add_expense' | 'add_income' | 'remove_transaction' | 'none';
  data?: {
    description?: string;
    amount?: number;
    category?: string;
    type?: 'income' | 'expense';
    date?: string;
  };
}

export interface AIRiskAssessment {
  riskLevel: 'high' | 'medium' | 'low';
  message: string;
}

export interface AIResponse {
  message: string;
  action?: AIAction;
  riskAssessment?: AIRiskAssessment;
  confidence?: number;
}

// --- Main Function ---

export const generateAIResponse = async (
  apiKey: string,
  userMessage: string,
  context: { transactions: Transaction[], balance: number },
  userName: string = "Usuário"
): Promise<AIResponse> => {
  
  // 1. Prepare Context (Sort & Limit to top 10 recent)
  const recentTransactions = [...context.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const summary = `
      Nome do Usuário: ${userName}
      Saldo Atual: R$ ${context.balance.toFixed(2)}
      Últimas Transações (Recentes):
      ${recentTransactions.map(t => 
        `- ${t.date}: ${t.description} (${t.category}) | R$ ${t.amount.toFixed(2)} (${t.type === 'income' ? 'Entrada' : 'Saída'})`
      ).join('\n')}
    `;

  // 2. Offline / Fallback checks
  if (!apiKey) {
    const localTips = analyzeFinancesLocal(context.transactions, context.balance);
    return {
       message: `Olá ${userName}! Estou no modo offline. Adicione sua API Key nos ajustes para eu ficar inteligente.`,
       riskAssessment: { 
         riskLevel: context.balance < 0 ? 'high' : 'low', 
         message: localTips[0] || "Modo Offline ativo." 
       }
    };
  }

  const modelsToTry = ["gemini-2.5-flash"]; 
  
  // Singleton Pattern for Performance
  if (!genAIInstance || lastApiKey !== apiKey.trim()) {
      genAIInstance = new GoogleGenerativeAI(apiKey.trim());
      lastApiKey = apiKey.trim();
  }
  const genAI = genAIInstance;

  const prompt = buildPrompt(userName, summary, userMessage);

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.2 // More deterministic
        }
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // 3. Robust Parsing
      const cleaned = cleanAIResponse(text);
      let parsed: AIResponse;

      try {
        parsed = JSON.parse(cleaned);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (jsonError) {
        console.warn(`JSON Parse failed for model ${modelName}. Cleaned text:`, cleaned);
        continue; // Try next model
      }

      // 4. Validate Structure
      if (!isValidAIResponse(parsed)) {
        console.warn(`Invalid JSON structure from ${modelName}`, parsed);
        continue; // Try next model
      }

      return parsed;

    } catch (error: unknown) {
      console.warn(`Falha com modelo ${modelName}:`, (error as Error).message);
    }
  }
  
  // 5. Smart Fallback if ALL AI attempts fail
  const localTips = analyzeFinancesLocal(context.transactions, context.balance);
  return { 
    message: "Estou com dificuldades de conexão no momento. Mas analisei seus dados localmente: " + (localTips[0] || "Tudo parece em ordem."),
    riskAssessment: { 
        riskLevel: context.balance < 0 ? 'high' : 'low', 
        message: localTips[0] || "IA Indisponível." 
    }
  };
};
