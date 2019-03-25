import { TestBed } from "@angular/core/testing";
import { HttpClient } from "@angular/common/http";
import { HttpTestingController, HttpClientTestingModule, TestRequest } from "@angular/common/http/testing";

import { HttpCacheControlCoreModule } from "../module";

export interface MockResponse {
	status: number;
	statusText: string;
	body: any;
}

const MOCK_RESPONSE = {
	heroes: [
		{
			name: "Batman",
			secretIdentity: "Bruce Wayne"
		},
		{
			name: "Superman",
			secretIdentity: "Clark Kent"
		}
	]
};


describe("HttpCacheControlIntegrationSpecs", () => {
	let httpBackend: HttpTestingController;
	let httpClient: HttpClient;

	beforeEach(() => {
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

		beforeEach(done => {
			httpClient.get("/api/heroes").subscribe(resp => firstResponse = resp);
			// in memory cache resolves promise async
			setTimeout(() => {
				firstReq = httpBackend.match(req => req.url === "/api/heroes")[0];
				done();
			});
		});

		it("should send a request", () => {
			expect(firstReq).toBeDefined();
		});

		describe("and response sent by the server is cacheable", () => {
			beforeAll(() => {
				firstReq.flush(MOCK_RESPONSE, {
					headers: {
						"cache-control": "max-age=100"
					}
				});
			});

			it("should get the correct response", () => {
				expect(firstResponse).toEqual(MOCK_RESPONSE);
			});

			describe("and there is another request to the same endpoint", () => {
				let secondReq: TestRequest;
				let secondResponse: object;

				beforeEach(() => {
					httpClient.get("/api/heroes").subscribe(resp => secondResponse = resp);
					secondReq = httpBackend.match(req => req.url === "/api/heroes")[0];
				});

				it("should not send a request", () => {
					expect(secondReq).toBeUndefined();
				});

				it("should set the response as expected", () => {
					expect(secondResponse).toEqual(MOCK_RESPONSE);
				});
			})
		});
	});

});