/// <reference path="../typings/http-cache-semantics.d.ts" />
import { Injectable, Inject } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse, HttpHeaders, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { from, of, Observable, Subject, throwError } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import * as HCS from "http-cache-semantics";

import { T_CACHE_STORE, CacheStore } from "../cache-store/cache-store.model";
import {
	HttpCacheControlEvent,
	ReturnResponseFromCacheEvent,
	StoreResponseInCacheEvent,
	UpdateResponseInCacheEvent
} from "../events/events.model";

import { CacheEntry, CachePolicyOptions, T_CACHE_POLICY_OPTIONS } from "./http-cache-control.model";
import {
	convertNgHeadersToRecord,
	convertNgResponseToPlainResponse,
	convertPlainResponseToNgResponse
} from "./http-cache-control.util";

@Injectable({ providedIn: "root" })
export class HttpCacheControlInterceptor implements HttpInterceptor {

	get events(): Observable<HttpCacheControlEvent> {
		return this._events.asObservable();
	}

	private _events = new Subject<HttpCacheControlEvent>();

	constructor(
		@Inject(T_CACHE_STORE) private cacheStore: CacheStore<CacheEntry>,
		@Inject(T_CACHE_POLICY_OPTIONS) private cachePolicyOptions: CachePolicyOptions
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
							const cachedNgResponse = convertPlainResponseToNgResponse({
								...cacheEntry.response,
								headers: cachePolicy.responseHeaders()
							});
							this._events.next(new ReturnResponseFromCacheEvent(incomingNgReq, cachedNgResponse));
							return of(cachedNgResponse);
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
						return this.runHandler(updatedNgReq, handler, ngResponseOrNotModified => {
							const responseOrNotModified = convertNgResponseToPlainResponse(ngResponseOrNotModified);
							const { policy: updatedolicy, modified } = cachePolicy.revalidatedPolicy(updatedReq, responseOrNotModified);
							const timeToLive = this.getCacheTimeToLive(updatedolicy, responseOrNotModified);
							const ngResponse = modified
								? ngResponseOrNotModified
								: convertPlainResponseToNgResponse({
									...cacheEntry.response,
									headers: updatedolicy.responseHeaders()
								});
							this._events.next(new UpdateResponseInCacheEvent(
								incomingNgReq,
								updatedNgReq,
								ngResponseOrNotModified,
								ngResponse,
								timeToLive,
								modified
							));
							this.cacheStore.set(
								updatedReq.url,
								{
									cachePolicy: updatedolicy.toObject(),
									response: modified ? responseOrNotModified : cacheEntry.response,
								},
								timeToLive
							);

							return ngResponse;
						});
					}

					return this.runHandler(incomingNgReq, handler, ngResponse => {
						const response = convertNgResponseToPlainResponse(ngResponse);
						const cachePolicy = new HCS(incomingReq, response, this.cachePolicyOptions);
						if (cachePolicy.storable()) {
							const timeToLive = this.getCacheTimeToLive(cachePolicy, response);
							if (timeToLive !== 0) {
								this._events.next(new StoreResponseInCacheEvent(incomingNgReq, ngResponse, timeToLive));
								this.cacheStore.set(
									incomingReq.url,
									{
										response,
										cachePolicy: cachePolicy.toObject(),
									},
									timeToLive
								);
							}
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

	private getCacheTimeToLive(cachePolicy: HttpCacheSemantics, response: HttpCacheSemanticsResponse): number | undefined {
		// if there is an etag, response might be revalidated after it expires
		// so should not be thrown away when time to live expires
		return response.headers["etag"] ? undefined : cachePolicy.timeToLive();
	}

}
