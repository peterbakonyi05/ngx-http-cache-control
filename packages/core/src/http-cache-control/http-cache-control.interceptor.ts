/// <reference path="../typings/http-cache-semantics.d.ts" />
import { Injectable, Inject, Optional } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse, HttpHeaders, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { from, of, Observable, throwError } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
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

	public intercept(incomingNgReq: HttpRequest<any>, handler: HttpHandler) {
		return from(this.cacheStore.get(incomingNgReq.urlWithParams))
			.pipe(
				mergeMap(cacheEntry => {
					const incomingReq = {
						url: incomingNgReq.urlWithParams,
						headers: convertNgHeadersToRecord(incomingNgReq.headers),
						method: incomingNgReq.method
					};

					if (cacheEntry) {
						const cachePolicy = HCS.fromObject(cacheEntry.cachePolicy);
						if (cachePolicy.satisfiesWithoutRevalidation(incomingReq)) {
							return of(convertPlainResponseToNgResponse({
								...cacheEntry.response,
								headers: cachePolicy.responseHeaders()
							}));
						}

						// change the request to ask the origin server if the cached response can be used
						const updatedHeaders = cachePolicy.revalidationHeaders(incomingReq);
						const updatedReq = {
							...incomingReq,
							headers: updatedHeaders
						};
						const updatedNgReq = incomingNgReq.clone({
							headers: new HttpHeaders(updatedHeaders)
						});
						return this.runHandler(updatedNgReq, handler, ngResponse => {
							const updatedresponse = convertNgResponseToPlainResponse(ngResponse);
							const { policy, modified } = cachePolicy.revalidatedPolicy(updatedReq, updatedresponse);
							this.cacheStore.set(updatedReq.url, {
								cachePolicy: policy.toObject(),
								response: modified ? updatedresponse : cacheEntry.response
								// TODO: because of this it might be removed from cache when it shouldn't (etag)
								// }, cachePolicy.timeToLive());
							});

							return modified
								? ngResponse
								: convertPlainResponseToNgResponse({
									...cacheEntry.response,
									headers: policy.responseHeaders()
								});
						});
					}

					return this.runHandler(incomingNgReq, handler, ngResponse => {
						const response = convertNgResponseToPlainResponse(ngResponse);
						const cachePolicy = new HCS(incomingReq, response, this.cachePolicyOptions);
						if (cachePolicy.storable()) {
							this.cacheStore.set(incomingReq.url, {
								response,
								cachePolicy: cachePolicy.toObject(),
								// TODO: because of this it might be removed from cache when it shouldn't (etag)
								// }, cachePolicy.timeToLive());
							});
						}
						return ngResponse;
					});
				})
			);
	}

	private runHandler(req: HttpRequest<any>, handler: HttpHandler, responseCallback: (response: HttpResponse<any>) => HttpResponse<any>): Observable<HttpEvent<any>> {
		return handler.handle(req)
			.pipe(
				catchError(err => {
					// Angular treats 304 Not Modified as an error by default (since it wouldn't be able to return the original response.)
					// With a cache layer it can be handled so map it to a normal response.
					if (err instanceof HttpErrorResponse && err.status === 304) {
						return of(new HttpResponse({
							headers: err.headers,
							status: err.status,
							statusText: err.statusText,
							url: err.url || undefined
						}));
					}

					return throwError(err);
				}),
				map(stateEvent => {
					if (stateEvent instanceof HttpResponse && stateEvent.url !== null) {
						return responseCallback(stateEvent);
					}
					return stateEvent;
				})
			)
	}

}
