import Hashids from 'hashids';

const hashids = new Hashids(
	process.env.URL_SALT || 'meu-salt-secreto',
	5,
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
);

export function generateSlug(counter: number): string {
	return hashids.encode(counter);
}

export function decodeSlug(slug: string): number {
	const decoded = hashids.decode(slug);
	return decoded[0] as number;
}
