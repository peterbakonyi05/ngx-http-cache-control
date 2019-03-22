import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from "@angular/common/http";
import { of } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class HttpCacheControlInterceptor implements HttpInterceptor {

	private cachedData = new Map<string, HttpResponse<any>>();

	constructor() {
	}

	public intercept(httpRequest: HttpRequest<any>, handler: HttpHandler) {
		if (httpRequest.method !== "GET") {
			return handler.handle(httpRequest);
		}

		const lastResponse = this.cachedData.get(httpRequest.urlWithParams);
		if (lastResponse) {
			return of(lastResponse.clone());
		}

		return handler.handle(httpRequest).pipe(
			tap((stateEvent) => {
				if (stateEvent instanceof HttpResponse) {
					this.cachedData.set(
						httpRequest.urlWithParams,
						stateEvent.clone()
					);
				}
			})
		);
	}

}
