export interface IUrlRepository {
	create(data: { shortcode: string; long_url: string; userId?: string }): Promise<{ shortcode: string }>;
	findByShortcode(shortcode: string): Promise<{ id: string; long_url: string; user_id: string | null } | null>;
}
