import { TestBed } from "@angular/core/testing";

import { T_CACHE_STORE, CacheStore } from "../cache-store/cache-store.model"
;
import { HttpCacheControlInterceptor } from "./http-cache-control.interceptor";

describe("HttpCacheControlInterceptorUnitSpecs", () => {

	let httpCacheControlInterceptor: HttpCacheControlInterceptor;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: T_CACHE_STORE,
					useValue: {
						add: jasmine.createSpy("add"),
						get: jasmine.createSpy("get")
					} as CacheStore
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