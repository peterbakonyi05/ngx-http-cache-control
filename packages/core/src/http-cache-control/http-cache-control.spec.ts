import { TestBed } from "@angular/core/testing";
import { HttpClient } from "@angular/common/http";
import { HttpTestingController, HttpClientTestingModule, TestRequest } from "@angular/common/http/testing";
import * as DateMock from "jest-date-mock";

import { HttpCacheControlCoreModule } from "../module";

const MOCK_RESPONSE = {
	heroes: [
		{ name: "Batman", secretIdentity: "Bruce Wayne" },
		{ name: "Superman", secretIdentity: "Clark Kent" }
	]
};

const MOCK_RESPONSE_NEW = {
	heroes: [
		...MOCK_RESPONSE.heroes,
		{ name: "Aquaman", secretIdentity: "Arthur Curry" }
	]
};

const MOCK_VILLAIN_RESPONSE = {
	heroes: [
		{ name: "Joker", secretIdentity: "Unknown" }
	]
};

const MOCK_MAX_AGE_SEC = 5;

/**
 * Note: interceptor (and cache) is shared for all specs to better simulate the real behavior.
 * That is why URLs have `v1` and `v2` to make sure they are not in the cache for unrelated specs.
 */
describe("HttpCacheControlIntegrationSpecs", () => {
	let httpBackend: HttpTestingController;
	let httpClient: HttpClient;

	beforeAll(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientTestingModule,
				HttpCacheControlCoreModule
			]
		});

		httpBackend = TestBed.get(HttpTestingController);
		httpClient = TestBed.get(HttpClient);
	});

	afterEach(() => {
		httpBackend.verify();
	});

	describe("when there is one http GET call", () => {
		let firstReq: TestRequest;
		let firstResponse: object;

		beforeAll(async () => {
			httpClient.get("/api/v1/heroes").subscribe(resp => firstResponse = resp);
			// in memory cache resolves promise async
			await Promise.resolve();
			firstReq = httpBackend.match(req => req.url === "/api/v1/heroes")[0];
		});

		it("should send a request", () => {
			expect(firstReq).toBeDefined();
		});

		describe("and response sent by the server is cacheable", () => {
			beforeAll(() => {
				firstReq.flush(MOCK_RESPONSE, {
					headers: {
						"cache-control": `max-age=${MOCK_MAX_AGE_SEC}`
					}
				});
			});

			it("should get the correct response", () => {
				expect(firstResponse).toEqual(MOCK_RESPONSE);
			});

			describe("and there is another request to the same endpoint within the given max age", () => {
				let secondReq: TestRequest;
				let secondResponse: object;

				beforeAll(() => {
					httpClient.get("/api/v1/heroes").subscribe(resp => secondResponse = resp);
					secondReq = httpBackend.match(req => req.url === "/api/v1/heroes")[0];
				});

				it("should not send a request", () => {
					expect(secondReq).toBeUndefined();
				});

				it("should set the response as expected", () => {
					expect(secondResponse).toEqual(MOCK_RESPONSE);
				});
			});

			describe("and there is another request to the same endpoint after cache expires", () => {
				let secondReq: TestRequest;
				let secondResponse: object;

				beforeAll(async () => {
					DateMock.advanceBy(MOCK_MAX_AGE_SEC * 1000);
					httpClient.get("/api/v1/heroes").subscribe(resp => secondResponse = resp);
					await Promise.resolve();
					secondReq = httpBackend.match(req => req.url === "/api/v1/heroes")[0];
					secondReq.flush(MOCK_RESPONSE_NEW, {
						headers: {
							"cache-control": `max-age=${MOCK_MAX_AGE_SEC}`
						}
					});
				});

				it("should send a request", () => {
					expect(secondReq).toBeDefined();
				});

				it("should set the response as expected", () => {
					expect(secondResponse).toEqual(MOCK_RESPONSE_NEW);
				});
			});

			describe("and there is another request to a different endpoint that does not support caching", () => {
				let secondReq: TestRequest;
				let secondResponse: object;

				beforeAll(async () => {
					httpClient.get("/api/v1/villains").subscribe(resp => secondResponse = resp);
					await Promise.resolve();
					secondReq = httpBackend.match(req => req.url === "/api/v1/villains")[0];
					secondReq.flush(MOCK_VILLAIN_RESPONSE);
				});

				it("should send a request", () => {
					expect(secondReq).toBeDefined();
				});

				it("should set the response as expected", () => {
					expect(secondResponse).toEqual(MOCK_VILLAIN_RESPONSE);
				});
			});
		});
	});

	describe("when response sent by the server is cacheable with revalidation support", () => {
		beforeAll(async () => {
			httpClient.get("/api/v2/heroes").subscribe();
			// in memory cache resolves promise async
			await Promise.resolve();
			const firstReq = httpBackend.match(req => req.url === "/api/v2/heroes")[0];
			firstReq.flush(MOCK_RESPONSE, {
				headers: {
					"cache-control": `max-age=${MOCK_MAX_AGE_SEC}`,
					"etag": "abc123"
				}
			});
		});

		describe("and server responsds with not modified after cache expires", () => {
			let secondReq: TestRequest;
			let secondResponse: object;

			beforeAll(async () => {
				DateMock.advanceBy(MOCK_MAX_AGE_SEC * 1000 + 1);
				httpClient.get("/api/v2/heroes").subscribe(resp => secondResponse = resp);
				await Promise.resolve();
				secondReq = httpBackend.match(req => req.url === "/api/v2/heroes")[0];
				secondReq.flush(null, {
					status: 304,
					statusText: "Not Modified",
					headers: {
						"etag": "abc123",
						"cache-control": `max-age=${MOCK_MAX_AGE_SEC}`
					}
				});
			});

			it("should send the etag token", () => {
				expect(secondReq.request.headers.get("if-none-match")).toEqual("abc123");
			});

			it("should set the response reusing the old data", () => {
				expect(secondResponse).toEqual(MOCK_RESPONSE);
			});

		});

		describe("and server responsds with an updated response after cache expires", () => {
			let secondReq: TestRequest;
			let secondResponse: object;

			beforeAll(async () => {
				DateMock.advanceBy(MOCK_MAX_AGE_SEC * 1000 + 1);
				httpClient.get("/api/v2/heroes").subscribe(resp => secondResponse = resp);
				await Promise.resolve();
				secondReq = httpBackend.match(req => req.url === "/api/v2/heroes")[0];
				secondReq.flush(MOCK_RESPONSE_NEW, {
					headers: {
						"etag": "def456",
						"cache-control": `max-age=${MOCK_MAX_AGE_SEC}`
					}
				});
			});

			it("should send the etag token", () => {
				expect(secondReq.request.headers.get("if-none-match")).toEqual("abc123");
			});

			it("should set the response with thew new data", () => {
				expect(secondResponse).toEqual(MOCK_RESPONSE_NEW);
			});
		});
	});

});