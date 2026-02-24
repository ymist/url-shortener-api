import { z } from 'zod';

export const createUrlSchema = z.object({
	long_url: z.string().url(),
});

export const shortcodeSchema = z.object({
	shortcode: z.string().min(1).max(20),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
