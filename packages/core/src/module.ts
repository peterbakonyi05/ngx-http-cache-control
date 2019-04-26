import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";

import { HttpCacheControlInterceptor } from "./http-cache-control/http-cache-control.interceptor";
import { T_CACHE_STORE } from "./cache-store/cache-store.model";
import { T_CACHE_POLICY_OPTIONS, CachePolicyOptions } from "./http-cache-control/http-cache-control.model";
import { MemoryCacheStoreService } from "./memory/memory-cache-store.service";
import { MemoryCacheStoreConfig, T_MEMORY_CACHE_STORE_CONFIG } from "./memory/memory-cache-store.model";

/**
 * Register this module at the root server module.
 *
 * Provide `T_MEMORY_CACHE_STORE_CONFIG` token at an application level to configure the in-memory cache size.
 *
 * Provide `T_CACHE_POLICY_OPTIONS` token at an application level to configure cache settings. Probably default values will just do fine.
 */
@NgModule({
	providers: [
		{
			provide: T_CACHE_STORE,
			useFactory: _memoryCacheStoreFactory,
			deps: [T_MEMORY_CACHE_STORE_CONFIG]
		},
		{
			provide: T_CACHE_POLICY_OPTIONS,
			useValue: {} as CachePolicyOptions
		},
		{
			provide: T_MEMORY_CACHE_STORE_CONFIG,
			useValue: {} as MemoryCacheStoreConfig
		},
		{
			provide: HTTP_INTERCEPTORS,
			useExisting: HttpCacheControlInterceptor,
			multi: true
		}
	]
})
export class HttpCacheControlCoreModule {

	constructor(httpCacheControl: HttpCacheControlInterceptor) {
		if (process.env.TRACE_NG_HTTP_CACHE) {
			httpCacheControl.events.subscribe(e => {
				console.log(e.toString());
			});
		}
	}

}

let memoryCache: MemoryCacheStoreService<any> | undefined;
/**
 * Angular creates a new app instance for each incoming request.
 * Cache needs to be singleton on the server.
 * @internal
 */
export function _memoryCacheStoreFactory(config: MemoryCacheStoreConfig | null) {
	if (memoryCache) {
		return memoryCache;
	}
	memoryCache = new MemoryCacheStoreService(config);
	return memoryCache;
}