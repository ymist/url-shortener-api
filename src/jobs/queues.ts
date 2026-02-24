import { Queue } from 'bullmq';
import { redis } from '#src/lib/redis.js';

export interface AnalyticsJobData {
	urlId: string;
	ip: string | null;
	userAgent: string | null;
	referer: string | null;
}

export const analyticsQueue = new Queue<AnalyticsJobData>('analytics', {
	connection: redis,
	defaultJobOptions: {
		removeOnComplete: 100,
		removeOnFail: 1000,
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 1000,
		},
	},
});
