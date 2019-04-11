import { InjectionToken } from "@angular/core";

/**
 * Generic cache store interface. Consumer of the package can override it using `T_CACHE_STORE` token
 * to provide another implementation (Redis, File System, CouchDB or any other storage).
 *
 * `T` is anything that can be serialized using `JSON.stringify`.
 */
export interface CacheStore<T = any> {

	get(key: string): Promise<T | undefined>;

	set(key: string, item: T, maxAge?: number): Promise<void>;

}

export const T_CACHE_STORE = new InjectionToken<CacheStore>("T_CACHE_STORE");