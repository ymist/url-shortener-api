import { analyticsQueue, type AnalyticsJobData } from '#src/jobs/queues.js';

interface RecordClickInput {
	urlId: string;
	ip: string | null;
	userAgent: string | null;
	referer: string | null;
}

export class RecordClickService {
	async execute(input: RecordClickInput): Promise<void> {
		const jobData: AnalyticsJobData = {
			urlId: input.urlId,
			ip: input.ip,
			userAgent: input.userAgent,
			referer: input.referer,
		};

		await analyticsQueue.add('record-click', jobData);
	}
}
