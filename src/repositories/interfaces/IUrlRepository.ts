export interface IUrlRepository {
	create(data: { shortcode: string; long_url: string }): Promise<{ shortcode: string }>;
	findByShortcode(shortcode: string): Promise<{ long_url: string } | null>;
}
