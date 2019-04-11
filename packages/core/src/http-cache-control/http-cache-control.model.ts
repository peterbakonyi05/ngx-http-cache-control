import { InjectionToken } from "@angular/core";

export interface PlainHttpResponse {
	url: string;
	status: number;
	statusText: string;
	headers: Record<string, string>;
	body: any;
}

export interface CacheEntry {
	cachePolicy: any;
	response: PlainHttpResponse;
}

export interface CachePolicyOptions {
	/**
	 * Fraction of response's age that is used as a fallback cache duration.
	 * The default is 0.1 (10%), e.g. if a file hasn't been modified for 100 days,
	 * it'll be cached for 100*0.1 = 10 days.
	 */
	cacheHeuristic?: number;

	/**
	 * Number of milliseconds to assume as the default time to cache responses with Cache-Control: immutable.
	 * Note that per RFC these can become stale, so max-age still overrides the default.
	 */
	immutableMinTimeToLive?: number;

	/**
	 * Default value is `true`.
	 * When set to `false`, server's Date header won't be used as the base for max-age.
	 * This is against the RFC, but it's useful if you want to cache responses with very short max-age,
	 * but your local clock is not exactly in sync with the server's.
	 */
	trustServerDate?: boolean,
}

export const T_CACHE_POLICY_OPTIONS = new InjectionToken<CachePolicyOptions>("T_CACHE_POLICY_OPTIONS");