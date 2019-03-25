import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { PlainHttpResponse } from "./http-cache-control.model";

export function convertPlainResponseToNgResponse(response: PlainHttpResponse): HttpResponse<any> {
	return new HttpResponse({
		url: response.url,
		status: response.status,
		statusText: response.statusText,
		headers: new HttpHeaders(response.headers),
		body: response.body,
	});
}

export function convertNgResponseToPlainResponse(response: HttpResponse<any>): PlainHttpResponse {
	return {
		url: response.url!,
		status: response.status,
		statusText: response.statusText,
		headers: convertNgHeadersToRecord(response.headers),
		body: response.body
	};
}


export function convertNgHeadersToRecord(headers: HttpHeaders): Record<string, string> {
	return headers.keys().reduce((result, name) => {
		if (headers.has(name)) {
			result[name] = headers.get(name)!;
		}
		return result;
	}, {} as Record<string, string>)
}
