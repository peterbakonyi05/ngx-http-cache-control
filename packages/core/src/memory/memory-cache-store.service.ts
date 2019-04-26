import * as LRU from "lru-cache";

import { CacheStore } from "../cache-store/cache-store.model";

import { MemoryCacheStoreConfig } from "./memory-cache-store.model";

const DEFAULT_MAX_CACHE_SIZE_IN_BYTES = 100 * 1024 * 1024;

export class MemoryCacheStoreService<T> implements CacheStore<T> {

	private cache: LRU.Cache<string, T>;

	constructor(
		config: MemoryCacheStoreConfig | null
	) {
		this.cache = new LRU({
			max: config && config.maxCacheSizeInBytes || DEFAULT_MAX_CACHE_SIZE_IN_BYTES,
			length: item => JSON.stringify(item).length
		});
	}

	async set(key: string, item: T, maxAge?: number): Promise<void> {
		this.cache.set(key, item, maxAge);
	}

	async get(key: string): Promise<T | undefined> {
		return this.cache.get(key);
	}

}