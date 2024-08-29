import type { Request, Response } from 'express';
import * as db from '../db/db.js';
import { getFromCache, setInCache } from '../db/redisClient.js';
import { SORT_BY } from '../models/enums.js';
import type { TCompanyWithHistoricalData } from '../models/companyModel.js';

type TQueryParams = {
    sortBy?: SORT_BY;
    exchange_symbol?: string;
    min_score?: number;
    includeHistoricalData?: 'true' | 'false';
    limit?: number;
    offset?: number;
};

const PRICE_CACHE_KEY = 'swsCompanyPriceClose';
const PRICE_CACHE_EXPIRATION = 80000000; // Set cache expiration such that prices update one per day

/**
 * Retrieves cached price data or queries the database and caches the result.
 * 
 * @returns {Promise<any[]>} - A promise that resolves to the price data array.
 */
async function getCachedPriceData(): Promise<any> {
    const cachedPrices = await getFromCache(PRICE_CACHE_KEY);
    if (cachedPrices) {
        return JSON.parse(cachedPrices);
    }

    // If not in cache, query the entire table and cache it
    const priceData = await db.runQuery('SELECT * FROM swsCompanyPriceClose');
    await setInCache(
        PRICE_CACHE_KEY,
        JSON.stringify(priceData),
        PRICE_CACHE_EXPIRATION
    );
    return priceData;
}

/**
 * Constructs the base SQL query for fetching company data.
 * 
 * @param {boolean} includeHistoricalData - Whether to include historical price data.
 * @param {boolean} includePriceFluctuation - Whether to include price fluctuation data.
 * @returns {Promise<string>} - A promise that resolves to the constructed SQL query string.
 */
async function constructBaseQuery(
    includeHistoricalData: boolean,
    includePriceFluctuation: boolean
): Promise<string> {
    const CURRENT_DATE = '2020-05-22';

    const priceData = await getCachedPriceData();

    // Create a map for quick lookups
    const priceMap = new Map<number, { date: string; price: number }[]>();
    priceData.forEach(
        (row: { company_id: number; date: string; price: number }) => {
            if (!priceMap.has(row.company_id)) {
                priceMap.set(row.company_id, []);
            }
            priceMap
                .get(row.company_id)!
                .push({ date: row.date, price: row.price });
        }
    );

    let sql = `
        SELECT 
            c.id,
            c.name,
            c.unique_symbol,
            s.total AS score,
            p.price AS last_price
    `;

    if (includePriceFluctuation) {
        sql += `,
            (SELECT MAX(price) - MIN(price) 
             FROM (VALUES ${Array.from(priceMap.values())
                 .flat()
                 .map(({ price }) => `(${price})`)
                 .join(',')}) AS fluctuation(price)
             WHERE date >= date('${CURRENT_DATE}', '-90 days')) AS price_fluctuation
        `;
    }

    if (includeHistoricalData) {
        sql += `,
            (SELECT json_group_array(json_object(
                'date', date,
                'price', price
            )) 
             FROM (VALUES ${Array.from(priceMap.values())
                 .flat()
                 .map(({ date, price }) => `('${date}', ${price})`)
                 .join(',')}) AS historical(date, price)
             WHERE company_id = c.id
            ) AS historical_prices
        `;
    }

    sql += `
        FROM 
            swsCompany c
        JOIN 
            swsCompanyScore s ON c.score_id = s.id
        LEFT JOIN 
            (SELECT company_id, price 
             FROM swsCompanyPriceClose 
             WHERE date = (SELECT MAX(date) 
                           FROM swsCompanyPriceClose 
                           WHERE company_id = company_id)
            ) p ON c.id = p.company_id
    `;

    return sql;
}
/**
 * Handles the HTTP request to fetch companies based on query parameters.
 * 
 * @param {Request} request - The Express request object containing query parameters.
 * @param {Response} response - The Express response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves when the response has been sent.
 */
export async function getCompanies(request: Request, response: Response): Promise<void> {
    const {
        sortBy,
        exchange_symbol,
        min_score,
        includeHistoricalData = 'false',
        limit = 30,
        offset = 0
    }: TQueryParams = request.query;

    try {
        let sql = await constructBaseQuery(
            includeHistoricalData === 'true',
            sortBy === SORT_BY.PRICE_FLUCTUATION
        );

        const filters: string[] = [];
        const params: any[] = [];

        if (exchange_symbol) {
            filters.push(`c.exchange_symbol = ?`);
            params.push(exchange_symbol);
        }

        if (min_score) {
            filters.push('s.total >= ?');
            params.push(min_score);
        }

        if (filters.length > 0) {
            sql += ' WHERE ' + filters.join(' AND ');
        }

        if (sortBy === SORT_BY.SCORE) {
            sql += ' ORDER BY s.total DESC';
        } else if (sortBy === SORT_BY.PRICE_FLUCTUATION) {
            sql += ' ORDER BY price_fluctuation DESC';
        }

        sql += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const companies: TCompanyWithHistoricalData[] =
            await db.runQuery<TCompanyWithHistoricalData>(sql, params);

        response.json({ data: companies });
    } catch (error: any) {
        console.error('Error fetching companies:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
}
