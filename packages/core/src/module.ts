import { NgModule } from "@angular/core";

import { HttpCacheControlInterceptor } from "./http-cache-control/http-cache-control.interceptor";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { T_HTTP_CACHE_STORE, HttpCacheStore } from './cache-store/cache-store.model';
import { MemoryCacheStoreService } from './memory/memory-cache-store.service';

/**
 * Register this module at the root server module.
 */
@NgModule({
	providers: [
		{
			provide: T_HTTP_CACHE_STORE,
			useClass: MemoryCacheStoreService
		},
		{
			provide: HTTP_INTERCEPTORS,
			useFactory: _httpCacheControlInterceptorFactory,
			multi: true,
			deps: [T_HTTP_CACHE_STORE]
		}
	]
})
export class HttpCacheControlCoreModule {

}

let cacheControlInterceptor: HttpCacheControlInterceptor | undefined;
// Angular creates a new app instance for each incoming request.
// Interceptor instance should be singleton on the server.
export function _httpCacheControlInterceptorFactory(cacheStore: HttpCacheStore) {
	if (cacheControlInterceptor) {
		return cacheControlInterceptor;
	}
	cacheControlInterceptor = new HttpCacheControlInterceptor(cacheStore);
	return cacheControlInterceptor;
}