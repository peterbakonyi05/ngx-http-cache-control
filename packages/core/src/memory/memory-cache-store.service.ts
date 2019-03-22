import { Injectable, Inject, Optional } from "@angular/core";
import * as LRU from "lru-cache";
import { CachedHttpResponse, HttpCacheStore } from "../cache-store/cache-store.model";
import { T_MEMORY_CACHE_STORE_CONFIG, MemoryCacheStoreConfig } from "./memory-cache-store.model";

@Injectable({ providedIn: "root" })
export class MemoryCacheStoreService implements HttpCacheStore {

	private cache: LRU.Cache<string, CachedHttpResponse>;

	constructor(
		@Optional() @Inject(T_MEMORY_CACHE_STORE_CONFIG) config: MemoryCacheStoreConfig | null
	) {
		this.cache = new LRU({
			max: config && config.maxCacheSizeInBytes || 100 * 1024 * 1024,
			length: item => JSON.stringify(item).length
		});
	}

	async storeResponse(key: string, response: CachedHttpResponse): Promise<void> {
		this.cache.set(`c:${key}`, response);
	}

	async getResponse(key: string): Promise<CachedHttpResponse | undefined> {
		return this.cache.get(`c:${key}`);
	}

}