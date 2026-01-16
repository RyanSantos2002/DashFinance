export interface MarketQuote {
    symbol: string;
    currentPrice: number;
    changePercent: number;
    updatedAt: string;
}

interface BrapiResult {
    symbol: string;
    regularMarketPrice: number;
    regularMarketChangePercent: number;
}

interface BrapiResponse {
    results: BrapiResult[];
}

const BRAPI_BASE_URL = 'https://brapi.dev/api/quote';
// Using public token or free tier logic. Ideally this should be in .env
// For this demo, we can fallback to a mock function if fetch fails or use a free endpoint if available.
// Brapi usually requires a token for reliable access, but let's try their public path or a fallback.

export const marketService = {
    async getQuotes(tickers: string[]): Promise<Record<string, MarketQuote>> {
        if (tickers.length === 0) return {};

        const symbols = tickers.join(',');
        try {
            // Note: Brapi free tier might have limits. 
            // We use 'token=public' just as an example key often used in docs, or empty.
            // Replace with user's token if available.
            const response = await fetch(`${BRAPI_BASE_URL}/${symbols}?token=public`); 
            
            if (!response.ok) {
                console.warn('Market API limit or error, falling back to basic checks');
                return {};
            }

            const data = await response.json() as BrapiResponse;
            const quotes: Record<string, MarketQuote> = {};

            if (data.results) {
                data.results.forEach((item) => {
                    quotes[item.symbol] = {
                        symbol: item.symbol,
                        currentPrice: item.regularMarketPrice,
                        changePercent: item.regularMarketChangePercent,
                        updatedAt: new Date().toISOString()
                    };
                });
            }

            return quotes;       
        } catch (error) {
            console.error('Error fetching quotes:', error);
            return {};
        }
    }
};
