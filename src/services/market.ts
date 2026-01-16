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

        // Use token from env or fallback to public
        const token = import.meta.env.VITE_BRAPI_TOKEN || 'public';
        const quotes: Record<string, MarketQuote> = {};

        try {
            // Fetch each ticker individually in parallel to avoid "multiple assets" limitation if using public/free tier
            const fetchPromises = tickers.map(async (symbol) => {
                try {
                    const response = await fetch(`${BRAPI_BASE_URL}/${symbol}?token=${token}`);
                    
                    if (!response.ok) {
                        if (response.status === 401) {
                            console.error(`Brapi API Unauthorized for ${symbol}: Check VITE_BRAPI_TOKEN`);
                        } else {
                            console.warn(`Market API error for ${symbol} (${response.status})`);
                        }
                        return null;
                    }

                    const data = await response.json() as BrapiResponse;
                    if (data.results && data.results.length > 0) {
                        return data.results[0];
                    }
                } catch (err) {
                    console.error(`Failed to fetch quote for ${symbol}`, err);
                }
                return null;
            });

            const results = await Promise.all(fetchPromises);

            results.forEach((item) => {
                if (item) {
                    quotes[item.symbol] = {
                        symbol: item.symbol,
                        currentPrice: item.regularMarketPrice,
                        changePercent: item.regularMarketChangePercent,
                        updatedAt: new Date().toISOString()
                    };
                }
            });

            return quotes;       
        } catch (error) {
            console.error('Error fetching quotes:', error);
            return {};
        }
    }
};
