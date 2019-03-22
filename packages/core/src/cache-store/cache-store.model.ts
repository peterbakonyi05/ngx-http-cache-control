import { InjectionToken } from '@angular/core';

export interface CachedHttpResponse {
	url: string;
	status: number;
	statusText: string;
	headers: Record<string, string | string[]>;
	body: any;
}


export interface HttpCacheStore {
	getResponse(key: string): Promise<CachedHttpResponse | undefined>;

	storeResponse(key: string, content: CachedHttpResponse): Promise<void>;
}

export const T_HTTP_CACHE_STORE = new InjectionToken<HttpCacheStore>("T_HTTP_CACHE_STORE");