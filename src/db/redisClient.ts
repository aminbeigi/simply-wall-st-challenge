//import { createClient } from 'redis';
//
//import { APP_REDIS_CLIENT_URL } from '../config.js';
//
//const redisClient = createClient({
//    url: APP_REDIS_CLIENT_URL
//});
//
//redisClient.on('error', (error) => console.log('Redis Client Error', error));
//
//// Ensure the client is connected
//redisClient.connect().catch((err) => {
//    console.error('Failed to connect to Redis:', err);
//});
//
//// Function to get data from cache
//export async function getFromCache(key: string): Promise<any> {
//    const cachedData = await redisClient.get(key);
//    return cachedData ? JSON.parse(cachedData) : null;
//}
//
//// Function to set data in cache with expiration
//export async function setInCache(
//    key: string,
//    data: any,
//    expiration: number
//): Promise<void> {
//    await redisClient.setEx(key, expiration, JSON.stringify(data));
//}


import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { APP_REDIS_CLIENT_URL } from '../config.js';

// Create and configure the Redis client
const redisClient: RedisClientType = createClient({
    url: APP_REDIS_CLIENT_URL,
});

// Error handling for Redis client
redisClient.on('error', (error) => {
    console.error('Redis Client Error:', error);
});

// Ensure the client is connected on initialization
(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
})();

/**
 * Retrieves data from the Redis cache.
 * 
 * @param {string} key - The key associated with the cached data.
 * @returns {Promise<any>} - A promise that resolves to the cached data, or null if no data is found.
 */
export async function getFromCache(key: string): Promise<any> {
    try {
        const cachedData = await redisClient.get(key);
        return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
        console.error(`Failed to get data from cache for key "${key}":`, error);
        throw new Error(`Could not retrieve data for key "${key}".`);
    }
}

/**
 * Sets data in the Redis cache with an expiration time.
 * 
 * @param {string} key - The key under which to store the data.
 * @param {any} data - The data to store in the cache.
 * @param {number} expiration - The expiration time in seconds.
 * @returns {Promise<void>} - A promise that resolves when the data has been set.
 */
export async function setInCache(
    key: string,
    data: any,
    expiration: number
): Promise<void> {
    try {
        await redisClient.setEx(key, expiration, JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to set data in cache for key "${key}":`, error);
        throw new Error(`Could not set data for key "${key}".`);
    }
}
