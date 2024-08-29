import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import { APP_DATABASE_PATH } from '../config.js';

// initialize and open the database connection
const dbPromise = open({
    filename: APP_DATABASE_PATH,
    driver: sqlite3.Database
});

async function getDb() {
    return dbPromise;
}

/**
 * Generic function to run a SQL query with parameters.
 *
 * @param {string} sql - The SQL query to run.
 * @param {Array<any>} params - The parameters to be used in the query.
 * @returns {Promise<T[]>} - A promise that resolves to the query results.
 */
export async function runQuery<T>(
    sql: string,
    params: any[] = []
): Promise<T[]> {
    try {
        const db = await getDb();
        const rows: T[] = await db.all(sql, params);
        return rows;
    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
}
