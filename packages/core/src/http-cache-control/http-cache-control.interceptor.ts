/// <reference path="../typings/http-cache-semantics.d.ts" />
import { Injectable, Inject, Optional } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from "@angular/common/http";
import { from, of } from "rxjs";
import { mergeMap, tap } from "rxjs/operators";
import * as HCS from "http-cache-semantics";

import { T_CACHE_STORE, CacheStore } from "../cache-store/cache-store.model";

import { CacheEntry, CachePolicyOptions, T_CACHE_POLICY_OPTIONS } from "./http-cache-control.model";
import {
	convertNgHeadersToRecord,
	convertNgResponseToPlainResponse,
	convertPlainResponseToNgResponse
} from "./http-cache-control.util";

@Injectable()
export class HttpCacheControlInterceptor implements HttpInterceptor {

	constructor(
		@Inject(T_CACHE_STORE) private cacheStore: CacheStore<CacheEntry>,
		@Optional() @Inject(T_CACHE_POLICY_OPTIONS) private cachePolicyOptions: CachePolicyOptions | null
	) {
	}

	public intercept(currentNgRequest: HttpRequest<any>, handler: HttpHandler) {
		return from(this.cacheStore.get(currentNgRequest.urlWithParams))
			.pipe(
				mergeMap(cacheEntry => {
					const currentPlainRequest = {
						url: currentNgRequest.urlWithParams,
						headers: convertNgHeadersToRecord(currentNgRequest.headers),
						method: currentNgRequest.method
					};

					if (cacheEntry) {
						const cachePolicy = HCS.fromObject(cacheEntry.cachePolicy);
						if (cachePolicy.satisfiesWithoutRevalidation(currentPlainRequest)) {
							return of(convertPlainResponseToNgResponse({
								...cacheEntry.response,
								headers: cachePolicy.responseHeaders()
							}));
						}

						// TODO: add Etag support
					}
					return handler.handle(currentNgRequest).pipe(
						// TODO: check if this should be a `mergeMap` / `switchMap`
						tap(stateEvent => {
							if (stateEvent instanceof HttpResponse && stateEvent.url !== null) {
								const plainResponse = convertNgResponseToPlainResponse(stateEvent);
								const cachePolicy = new HCS(currentPlainRequest, plainResponse, this.cachePolicyOptions);
								if (cachePolicy.storable()) {
									this.cacheStore.add(currentPlainRequest.url, {
										cachePolicy: cachePolicy.toObject(),
										response: plainResponse
									});
								}
							}
						})
					)
				})
			);
	}

}
