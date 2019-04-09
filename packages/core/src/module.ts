import { NgModule } from "@angular/core";

import { HttpCacheControlInterceptor } from "./http-cache-control/http-cache-control.interceptor";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { T_CACHE_STORE, CacheStore } from './cache-store/cache-store.model';
import { MemoryCacheStoreService } from './memory/memory-cache-store.service';
import { T_CACHE_POLICY_OPTIONS, CachePolicyOptions } from './http-cache-control/http-cache-control.model';

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
			useClass: MemoryCacheStoreService
		},
		{
			provide: T_CACHE_POLICY_OPTIONS,
			useValue: {} as CachePolicyOptions
		},
		{
			provide: HTTP_INTERCEPTORS,
			useFactory: _httpCacheControlInterceptorFactory,
			multi: true,
			deps: [T_CACHE_STORE, T_CACHE_POLICY_OPTIONS]
		}
	]
})
export class HttpCacheControlCoreModule {

}

let cacheControlInterceptor: HttpCacheControlInterceptor | undefined;
/** Angular creates a new app instance for each incoming request.
 *  Interceptor instance should be singleton on the server.
 */
export function _httpCacheControlInterceptorFactory(store: CacheStore, options: CachePolicyOptions | null) {
	if (cacheControlInterceptor) {
		return cacheControlInterceptor;
	}
	cacheControlInterceptor = new HttpCacheControlInterceptor(store, options);
	return cacheControlInterceptor;
}