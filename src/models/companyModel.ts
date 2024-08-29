export type TCompany = {
    id: string;
    name: string;
    unique_symbol: string;
    score: number;
    exhange_symbol?: string;
    last_price?: number;
    price_fluctuation?: number;
};

export type TPastSharePrice = {
    date: string;
    price: number;
};

export type TCompanyWithHistoricalData = TCompany & {
    historical_prices?: TPastSharePrice[];
};