import { NgModule } from "@angular/core";

import { HttpCacheControlInterceptor } from "./http-cache-control/http-cache-control.interceptor";
import { HTTP_INTERCEPTORS } from '@angular/common/http';

/**
 * Register this module at the root server module.
 */
@NgModule({
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useFactory: _httpCacheControlInterceptorFactory,
			multi: true
		}
	]
})
export class HttpCacheControlCoreModule {

}

let cacheControlInterceptor: HttpCacheControlInterceptor | undefined;
// Angular creates a new app instance for each incoming request.
// Interceptor instance should be singleton on the server.
export function _httpCacheControlInterceptorFactory() {
	if (cacheControlInterceptor) {
		return cacheControlInterceptor;
	}
	cacheControlInterceptor = new HttpCacheControlInterceptor();
	return cacheControlInterceptor;
}