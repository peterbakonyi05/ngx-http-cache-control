import { InjectionToken } from '@angular/core';

export interface CacheStore<T = any> {

	get(key: string): Promise<T | undefined>;

	set(key: string, item: T, maxAge?: number): Promise<void>;

}

export const T_CACHE_STORE = new InjectionToken<CacheStore>("T_CACHE_STORE");