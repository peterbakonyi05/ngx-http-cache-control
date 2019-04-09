import { Injectable, Inject, Optional } from "@angular/core";
import * as LRU from "lru-cache";

import { CacheStore } from "../cache-store/cache-store.model";

import { T_MEMORY_CACHE_STORE_CONFIG, MemoryCacheStoreConfig } from "./memory-cache-store.model";

const DEFAULT_MAX_CACHE_SIZE_IN_BYTES = 100 * 1024 * 1024;

@Injectable({ providedIn: "root" })
export class MemoryCacheStoreService<T> implements CacheStore<T> {

	private cache: LRU.Cache<string, T>;

	constructor(
		@Optional() @Inject(T_MEMORY_CACHE_STORE_CONFIG) config: MemoryCacheStoreConfig | null
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