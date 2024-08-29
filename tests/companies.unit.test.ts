import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

import companyRouter from '../src/routes/companyRoutes.js';
import { MOCK_COMPANIES } from './mock_data.js';
import * as db from '../src/db/db.js';

const API_PATH = '/api/v1/companies';

// Initalise Express app for testing
const app = express();
app.use(express.json());
app.use(API_PATH, companyRouter);

// mock the database query function
vi.mock('../src/db/db.js', () => ({
    runQuery: vi.fn()
}));

const mockRunQuery = db.runQuery as vi.MockedFunction<typeof db.runQuery>;

describe('GET /api/v1/companies', () => {
    it('should return a list of companies', async () => {
        mockRunQuery.mockResolvedValue(MOCK_COMPANIES);

        const response = await request(app)
            .get(API_PATH)
            .query({ limit: 10, offset: 0 });

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(MOCK_COMPANIES);
    });

    it('should apply query filters', async () => {
        const filteredCompanies = MOCK_COMPANIES.filter(
            (company) =>
                company.exchange_symbol === 'ASX' && company.score >= 1000
        );
        mockRunQuery.mockResolvedValue(filteredCompanies);

        const response = await request(app).get(API_PATH).query({
            exchange_symbol: 'ASX',
            min_score: 1000,
            limit: 10,
            offset: 0
        });

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(filteredCompanies);
    });

    it('should sort companies by score', async () => {
        const sortedCompanies = [...MOCK_COMPANIES].sort(
            (a, b) => b.score - a.score
        );
        mockRunQuery.mockResolvedValue(sortedCompanies);

        const response = await request(app)
            .get(API_PATH)
            .query({ sortBy: 'score', limit: 10, offset: 0 });

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(sortedCompanies);
    });

    it('should sort companies by price fluctuation', async () => {
        const sortedCompanies = [...MOCK_COMPANIES].sort(
            (a, b) => b.price_fluctuation - a.price_fluctuation
        );
        mockRunQuery.mockResolvedValue(sortedCompanies);

        const response = await request(app)
            .get(API_PATH)
            .query({ sortBy: 'price_fluctuation', limit: 10, offset: 0 });

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(sortedCompanies);
    });

    it('should handle pagination', async () => {
        const paginatedCompanies = MOCK_COMPANIES.slice(0, 1);
        mockRunQuery.mockResolvedValue(paginatedCompanies);

        const response = await request(app)
            .get(API_PATH)
            .query({ limit: 1, offset: 0 });

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(paginatedCompanies);
    });

    it('should include historical data when enabled', async () => {
        const companiesWithHistoricalData = [
            {
                ...MOCK_COMPANIES[0],
                historical_prices: [
                    { date: '2020-05-01', price: 140.0 },
                    { date: '2020-05-02', price: 145.0 }
                ]
            }
        ];
        mockRunQuery.mockResolvedValue(companiesWithHistoricalData);

        const response = await request(app)
            .get(API_PATH)
            .query({ includeHistoricalData: 'true', limit: 10, offset: 0 });

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(companiesWithHistoricalData);
    });
});
