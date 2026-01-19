import { z } from 'zod';

export const createUrlSchema = z.object({
	long_url: z.string().url(),
});

export const shortcodeSchema = z.object({
	shortcode: z.string().length(5),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
