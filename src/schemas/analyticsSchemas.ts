import { z } from 'zod';

export const analyticsParamsSchema = z.object({
	shortcode: z.string().length(5),
});

export type AnalyticsParams = z.infer<typeof analyticsParamsSchema>;
