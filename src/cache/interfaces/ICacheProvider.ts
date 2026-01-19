export interface ICacheProvider {
	incr(key: string): Promise<number>;
	get(key: string): Promise<string | null>;
	set(key: string, value: string, ttl?: number): Promise<void>;
}
