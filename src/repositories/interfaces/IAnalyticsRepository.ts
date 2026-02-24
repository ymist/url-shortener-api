export interface CreateAnalyticsData {
	urlId: string;
	ip: string | null;
	userAgent: string | null;
	referer: string | null;
}

export interface AnalyticsRecord {
	id: string;
	urlId: string;
	ip: string | null;
	userAgent: string | null;
	referer: string | null;
	clickedAt: Date;
}

export interface ClicksByDay {
	date: string;
	count: number;
}

export interface UrlAnalytics {
	totalClicks: number;
	clicksByDay: ClicksByDay[];
	topReferers: string[];
}

export interface IAnalyticsRepository {
	create(data: CreateAnalyticsData): Promise<AnalyticsRecord>;
	findByUrlId(urlId: string): Promise<UrlAnalytics>;
}
