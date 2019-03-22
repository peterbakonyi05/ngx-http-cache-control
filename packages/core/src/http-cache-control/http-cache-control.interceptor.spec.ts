import { TestBed } from "@angular/core/testing";

import { HttpCacheControlInterceptor } from "./http-cache-control.interceptor";
import { T_HTTP_CACHE_STORE, HttpCacheStore } from '../cache-store/cache-store.model';

describe("HttpCacheControlInterceptorUnitSpecs", () => {

	let httpCacheControlInterceptor: HttpCacheControlInterceptor;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: T_HTTP_CACHE_STORE,
					useValue: {
						getResponse: jasmine.createSpy("getResponse"),
						storeResponse: jasmine.createSpy("storeResponse")
					} as HttpCacheStore
				},
				HttpCacheControlInterceptor
			]
		});

		httpCacheControlInterceptor = TestBed.get(HttpCacheControlInterceptor);
	});

	it("should be created", () => {
		expect(httpCacheControlInterceptor).toBeDefined();
	});
});