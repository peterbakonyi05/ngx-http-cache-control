# @ngx-http-cache-control/core

## How to use this package?

### Install

```sh
npm i @ngx-http-cache-control/core
```

### Import Angular module
This package should only be imported part of the server-side Angular module. Typically that module is placed in a file named `app.server.module.ts`. [universal-starter](https://github.com/angular/universal-starter/blob/master/src/app/app.server.module.ts) can serve as a good reference point.

```ts
import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { HttpCacheControlCoreModule } from "@ngx-http-cache-control/core";

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ModuleMapLoaderModule,
    HttpCacheControlCoreModule
  ],
  bootstrap: [AppComponent]
})
export class AppServerModule { }

```

### Optional configuration

#### Overriding default memory cache config
```ts
import { MemoryCacheStoreConfig, T_MEMORY_CACHE_STORE_CONFIG } from "@ngx-http-cache-control/core";

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ModuleMapLoaderModule,
    HttpCacheControlCoreModule
  ],
  providers: [
    {
      provide: T_MEMORY_CACHE_STORE_CONFIG,
      useValue: {
        maxCacheSizeInBytes: 500 * 1024 * 1024 // default is 100MB
      } as MemoryCacheStoreConfig
    }
  ]
  bootstrap: [AppComponent]
})
export class AppServerModule { }
```

#### Overriding default cache policy options

Default values should be fine for most use-cases.


```ts
import { CachePolicyOptions, T_CACHE_POLICY_OPTIONS } from "@ngx-http-cache-control/core";

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ModuleMapLoaderModule,
    HttpCacheControlCoreModule
  ],
  providers: [
    {
      provide: T_CACHE_POLICY_OPTIONS,
      useValue: {
        trustServerDate: false
      } as CachePolicyOptions
    }
  ]
  bootstrap: [AppComponent]
})
export class AppServerModule { }
```


#### Replacing the cache layer
By default the cache is an [in-memory LRU cache](https://www.npmjs.com/package/lru-cache).

This is a really simple and fast solution (no external services are required, works out of the box).

The main disadvantage: cache will not be shared if you have multiple node processes (each process will have its own memory cache). Depending on your use-case, this might be completely fine or totally unacceptable.

You can easily override the default cache store with your own implementation (there is a plan to officially support Redis later on).

##### First create a service that implements the `CacheStore` interface
```ts
import { Injectable } from "@angular/core";
import { CacheStore } from "@ngx-http-cache-control/core"

@Injectable()
export class MyCacheStore<T> implements CacheStore<T> {

    /**
     * Return the data cached behind this key.
     * Don't forget to deserialize if you stored the data serialized
     */
    get(key: string): Promise<T | undefined> {
        // implementation comes here
    }

    /**
     * Store the data cached under the given key.
     *
     * `item` can be an object and need to be serialized if you use a store that only accepts string values
     *
     * Using `maxAge` is optional. It can help keeping the cache size smaller.
     * If you don't use it and store the data forever, it will not cause any problems.
     * Library validates max age based on the headers and won't use cached response if it expired
     */
    set(key: string, item: T, maxAge?: number): Promise<void> {
        // implementation comes here
    }
}

```

##### Then provide your service as the cache store
```ts
import { CachePolicyOptions, T_CACHE_POLICY_OPTIONS } from "@ngx-http-cache-control/core";

import { MyCacheStore } from "./my-cache-store";

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ModuleMapLoaderModule,
    HttpCacheControlCoreModule
  ],
  providers: [
    {
      provide: T_CACHE_STORE,
      useClass: MyCacheStore
    }
  ]
  bootstrap: [AppComponent]
})
export class AppServerModule { }
```

## Why was this package created?

### Problem

To render a more complex page in a web application, typically the app needs to make multiple HTTP requests to get the required data for the given view.

With a traditional Single-Page Application (SPA) approach, normally the server serves an application shell and when the application is bootstrapping on the client-side, it will make these calls. When API responses arrive one by one, App will render the view progressively. Most of these requests are GET requests that are often cached by the browser (if user is a returning visitor) or by a CDN / HTTP Accelerator (i.e.: Varnish).

When Angular is running on the server, to render the requested page, all required HTTP calls are made on the server to get the data and generate the view server-side. Angular will make HTTP calls. Even if these API calls return Cache-Control headers, Angular will ignore them and for every incoming requests, Angular will make those HTTP calls all over again. If you have a simple application with a few visitors, this might be acceptable.

For a more complex application with high-traffic, making those HTTP calls and waiting for the response can easily become a bottleneck with Server-Side rendering.

```
Simple example without caching API calls:
* 5 concurrent requests per second to get the same page (could be the average traffic hitting your home page)
* for each request, app needs to make 10 API calls to render the view (get footer, menu, banners etc.)

That's 50 HTTP calls to the API per second. 90.000 HTTP calls each 30 minutes.

If all those API calls return Cache-Control headers and allow caching for 30 minutes,
then by using `@ngx-http-cache-control/core` library, it could be 10 HTTP calls per 30 minutes.

Probably a real-life scenario is more complex than this, but the performance improvements can be huge.
```


### Solution 1 - Addig a cache server in front of your site
If performance is critical, adding a cache server in front of your site is recommended. Then you don't need to run server-side rendering on the fly for each incoming requests. If most of your visitors visit just a handful of pages (or your application doesn't have millions of different pages), this will result in a big performance boost.

When will a cache server not provide a big performance improvement?
In general when there are a lot different page requests that are not yet cached.

Some of the examples:
* most of your pages cannot be cached (example: view is customer specific and most of your visitors are logged in)
* you need to vary the view based on User-Agent or some cookies and cache hit ratio is low
* there are many popular pages and traffic is more or less evenly distributed (example: products in a webshop available in many different languages)
* content in your app changes rapidly and there are new pages realy often

### Solution 2 - Addig a cache server in front of your API
Similar to solution 2. Instead of caching the entire response generated by Angular, you can cache some of the API calls.

### Solution 3 - Using `@ngx-http-cache-control/core` 
Using this library to cache the responses in-memory. Compared to solution 2 and solution 3, this is a more light-weight and simpler solution.

## How does it work?

HTTP specifies Cache-Control headers to levarge the performance improvement of caching.

Read a short explanation:
* https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching
More detailed:
* https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
Specs:
* https://httpwg.org/specs/rfc7234.html

Under the hood this package is using [http-cache-semantics](https://www.npmjs.com/package/http-cache-semantics) package to decide when a response can be served from the cache instead of making an HTTP call.

It also supports revalidation of staled requests.



