import Redis, { Redis as RedisClient } from 'ioredis';
import cacheConfig from './index';

export default class RedisCache {
    private client : RedisClient;

    constructor() {
        this.client = new Redis(cacheConfig.config.redis);
    }
    
    public async set(key: string, value: any) : Promise<void> {
        await this.client.set(key, JSON.stringify(value));
    } 

    public async get<T>(key: string) : Promise<T | null> {
        const data = await this.client.get(key);

        if(!data) {
            return null;
        }

        return JSON.parse(data) as T;
        
    }

    public async delete(key: string) : Promise<void> {
     await this.client.del(key);   
    }

    
}