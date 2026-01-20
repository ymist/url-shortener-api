import { Redis } from 'ioredis';
import { ICacheProvider } from '../interfaces/ICacheProvider';


export class RedisCacheProvider implements ICacheProvider {
	constructor(private redis: Redis) {}

	async incr(key: string): Promise<number> {
		return await this.redis.incr(key);
	}

	async get(key: string): Promise<string | null> {
		return await this.redis.get(key);
	}

	async set(key: string, value: string, ttl?: number): Promise<void> {
		if (ttl) {
			await this.redis.set(key, value, 'EX', ttl);
		} else {
			await this.redis.set(key, value);
		}
	}
}
