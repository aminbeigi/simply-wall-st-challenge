import type { TCompany } from '../src/models/companyModel';

export const MOCK_COMPANIES: TCompany[] = [
    {
        id: '46B285BC-B25F-4814-985C-390A4BFA2023',
        name: 'Afterpay',
        unique_symbol: 'ASX:APT',
        score: 26507,
        last_price: 150.0,
        price_fluctuation: 30
    },
    {
        id: '4BE2C01F-F390-479C-A166-8E0DD73CF7B9',
        name: 'BHP Group',
        unique_symbol: 'ASX:BHP',
        score: 1895,
        last_price: 200.0,
        price_fluctuation: 40
    },
    {
        id: 'FC7B296B-300B-4710-8F84-D68A5BFBC75B',
        name: 'Telstra',
        unique_symbol: 'ASX:TLS',
        score: 1,
        last_price: 100.0,
        price_fluctuation: 10
    },
    {
        id: '743F0744-8987-4339-B565-DEE3A93E9934',
        name: 'Apple',
        unique_symbol: 'NasdaqGS:AAPL',
        score: 162,
        last_price: 300.0,
        price_fluctuation: 50
    },
    {
        id: 'D0665877-9EC5-4568-8A29-E8FFF77DF072',
        name: 'Amazon.com',
        unique_symbol: 'NasdaqGS:AMZ',
        score: 33,
        last_price: 250.0,
        price_fluctuation: 20
    }
];
