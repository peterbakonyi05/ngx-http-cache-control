import { InjectionToken } from '@angular/core';

export interface MemoryCacheStoreConfig {
	/**
	 * Max cache size in bytes.
	 * Default value is 100MB.
	 */
	maxCacheSizeInBytes?: number;
}

export const T_MEMORY_CACHE_STORE_CONFIG = new InjectionToken<MemoryCacheStoreConfig>("T_MEMORY_CACHE_STORE_CONFIG");