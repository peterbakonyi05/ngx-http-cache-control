// TODO: open a PR with proper definition files for `http-cache-semantics` or DefinitelyTyped
interface HttpCacheSemanticsRequest {
	url: string;
	method: string;
	headers: Record<string, string>;
}

interface HttpCacheSemantics {
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
	toObject(): any;
	storable(): boolean;
	satisfiesWithoutRevalidation(newRequest: HttpCacheSemanticsRequest): boolean;
	responseHeaders(): Record<string, string>;
}

declare module "http-cache-semantics" {
	export = HttpCacheSemantics;
}