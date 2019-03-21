import { NgModule } from "@angular/core";

import { HttpCacheControlInterceptor } from "./http-cache-control/http-cache-control.interceptor";

@NgModule({
	providers: [
		HttpCacheControlInterceptor
	]
})
export class HttpCacheControlCoreModule {

}