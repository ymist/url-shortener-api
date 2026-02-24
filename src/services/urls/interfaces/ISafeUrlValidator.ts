export interface ISafeUrlValidator {
	isSafe(url: string): Promise<boolean>;
}
