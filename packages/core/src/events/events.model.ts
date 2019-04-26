import { HttpRequest, HttpResponse } from "@angular/common/http";

export class StoreResponseInCacheEvent {

	constructor(
		public request: HttpRequest<any>,
		public response: HttpResponse<any>,
		public timeToLiveSeconds: number | undefined
	) { }

	toString() {
		return `NGX_HTTP_CACHE_CONTROL::StoreResponseInCacheEvent: ${this.request.method} ${this.request.urlWithParams}. TTL: ${this.timeToLiveSeconds ? this.timeToLiveSeconds : "unlimited"} sec`;
	}
}

export class ReturnResponseFromCacheEvent {
	constructor(
		public request: HttpRequest<any>,
		public response: HttpResponse<any>
	) { }

	toString() {
		return `NGX_HTTP_CACHE_CONTROL::ReturnResponseFromCacheEvent: ${this.request.method} ${this.request.urlWithParams}`;
	}
}

export class UpdateResponseInCacheEvent {
	constructor(
		/** Incoming request */
		public incomingRequest: HttpRequest<any>,
		/** Actual request that is sent to the server. Extra headers like `If-None-Match` will be present. */
		public updatedRequest: HttpRequest<any>,
		/** Actual resposne returned by the server. May be a 304 Not Modified that will be server from cache. */
		public serverResponse: HttpResponse<any>,
		/** Response returned by the interceptor. Either new response from server or from cache if server returned 304. */
		public returnedResponse: HttpResponse<any>,
		public timeToLiveSeconds: number | undefined,
		public modified: boolean
	) { }

	toString() {
		return `NGX_HTTP_CACHE_CONTROL::UpdateResponseInCacheEvent: ${this.incomingRequest.method} ${this.incomingRequest.urlWithParams} was revalidated and has ${this.modified ? "changed" : "not changed"}. New TTL: ${this.timeToLiveSeconds ? this.timeToLiveSeconds : "unlimited"} sec`;
	}
}

export type HttpCacheControlEvent = StoreResponseInCacheEvent | ReturnResponseFromCacheEvent | UpdateResponseInCacheEvent;
