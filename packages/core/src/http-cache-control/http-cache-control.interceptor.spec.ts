import { TestBed } from "@angular/core/testing";

import { HttpCacheControlInterceptor } from "./http-cache-control.interceptor";

describe("HttpCacheControlInterceptorSpecs", () => {

	let httpCacheControlInterceptor: HttpCacheControlInterceptor;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				HttpCacheControlInterceptor
			]
		});

		httpCacheControlInterceptor = TestBed.get(HttpCacheControlInterceptor);
	});

	it("should be created", () => {
		expect(httpCacheControlInterceptor).toBeDefined();
	});
});