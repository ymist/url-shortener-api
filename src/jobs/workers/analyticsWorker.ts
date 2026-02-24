import { Worker, Job } from 'bullmq';
import { redis } from '#src/lib/redis.js';
import { prisma } from '#src/lib/prisma.js';
import { AnalyticsRepository } from '#src/repositories/prisma/AnalyticsRepository.js';
import type { AnalyticsJobData } from '../queues.js';

const analyticsRepository = new AnalyticsRepository(prisma);

export const analyticsWorker = new Worker<AnalyticsJobData>(
	'analytics',
	async (job: Job<AnalyticsJobData>) => {
		const { urlId, ip, userAgent, referer } = job.data;

		await analyticsRepository.create({
			urlId,
			ip,
			userAgent,
			referer,
		});

		return { success: true };
	},
	{
		connection: redis,
		concurrency: 10,
	}
);

analyticsWorker.on('completed', (job) => {
	console.log(`Analytics job ${job.id} completed`);
});

analyticsWorker.on('failed', (job, err) => {
	console.error(`Analytics job ${job?.id} failed:`, err.message);
});
