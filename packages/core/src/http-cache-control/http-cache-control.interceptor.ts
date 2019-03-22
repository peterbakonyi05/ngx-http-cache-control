import { Injectable, Inject } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from "@angular/common/http";
import { from, of } from "rxjs";
import { mergeMap, tap } from "rxjs/operators";

import { T_HTTP_CACHE_STORE, HttpCacheStore } from '../cache-store/cache-store.model';
import { convertNgResponseToCachedResponse, convertCachedResponseToNgResponse } from '../cache-store/cache-store.util';

@Injectable()
export class HttpCacheControlInterceptor implements HttpInterceptor {

	constructor(
		@Inject(T_HTTP_CACHE_STORE) private cacheStore: HttpCacheStore
	) {
	}

	public intercept(httpRequest: HttpRequest<any>, handler: HttpHandler) {
		if (httpRequest.method !== "GET") {
			return handler.handle(httpRequest);
		}

		return from(this.cacheStore.getResponse(httpRequest.urlWithParams))
			.pipe(
				mergeMap(response => {
					return response
						? of(convertCachedResponseToNgResponse(response))
						: handler.handle(httpRequest).pipe(
							tap((stateEvent) => {
								if (stateEvent instanceof HttpResponse && stateEvent.url !== null) {
									this.cacheStore.storeResponse(
										stateEvent.url,
										convertNgResponseToCachedResponse(stateEvent)
									);
								}
							})
						)
				})
			);
	}

}
