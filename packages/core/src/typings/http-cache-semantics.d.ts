// TODO: open a PR with proper definition files for `http-cache-semantics` or DefinitelyTyped
interface HttpCacheSemanticsRequest {
	url: string;
	method: string;
	headers: Record<string, string>;
}

interface HttpCacheSemanticsResponse {
	status: number;
	headers: Record<string, string>;
}

interface HttpCacheSemantics {
	shared?: boolean;
	cacheHeuristic?: number;
	immutableMinTimeToLive?: number;
	ignoreCargoCult?: boolean;
	trustServerDate?: boolean;
}

declare namespace HttpCacheSemantics {
	declare interface HttpCacheSemanticsRequest extends HttpCacheSemanticsRequest { }
	declare interface HttpCacheSemanticsResponse extends HttpCacheSemanticsResponse { }
	declare interface HttpCacheSemanticsOptions extends HttpCacheSemanticsOptions { }

}

declare class HttpCacheSemantics {
	constructor(
		request: HttpCacheSemanticsRequest,
		response: HttpCacheSemanticsResponse,
		options?: HttpCacheSemanticsOptions
	);

	static fromObject(o: any): HttpCacheSemantics;

	/**
	 * Returns time to live in seconds.
	 */
	timeToLive(): number;

	toObject(): any;

	storable(): boolean;

	satisfiesWithoutRevalidation(newRequest: HttpCacheSemanticsRequest): boolean;

	responseHeaders(): Record<string, string>;

	/**
	 * Headers for sending to the origin server to revalidate stale response.
	 * Allows server to return 304 to allow reuse of the previous response.
	 *
	 * Hop by hop headers are always stripped.
	 * Revalidation headers may be added or removed, depending on request.
	 */
	revalidationHeaders(incomingReq: HttpCacheSemanticsRequest): Record<string, string>;

	/**
	 * Creates new CachePolicy with information combined from the previews response,
	 * and the new revalidation response.
	 *
	 * Returns {policy, modified} where modified is a boolean indicating
	 * whether the response body has been modified, and old cached body can't be used.
	 */
	revalidatedPolicy(request: HttpCacheSemanticsRequest, response: HttpCacheSemanticsResponse): { policy: HttpCacheSemantics, modified: boolean };

}

declare module "http-cache-semantics" {
	export = HttpCacheSemantics;
}