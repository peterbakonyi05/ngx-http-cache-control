# ngx-cache-control-core

## How to use it?

TODO: add detail

## Why is it needed?

### Problem

To render a more complex page in a web application, typically the app needs to make multiple HTTP requests to get the required data for the given view.

With a traditional Single-Page Application (SPA) approach, normally the server serves an application shell and when the application is bootstrapping on the client-side, it will make these calls. When API responses arrive one by one, App will render the view progressively. Most of these requests are GET requests that are often cached by the browser (if user is a returning visitor) or by a CDN / HTTP Accelerator (i.e.: Varnish).

When Angular is running on the server, to render the requested page, all required HTTP calls are made on the server to get the data and generate the view server-side. Angular will make HTTP calls. Even if these API calls return Cache-Control headers, Angular will ignore them and for every incoming requests, Angular will make those HTTP calls all over again. If you have a simple application with a few visitors, this is completely fine.

### Solution 1 - Addig a cache server in front of your site
If performance is critical, adding a cache server in front of your site is recommended. Then you don't need to run server-side rendering on the fly for each incoming requests. If most of your visitors visit just a handful of pages (or your application doesn't have millions of different pages), this will result in a big performance boost.

When will a cache server not provide a big performance improvement?
In general when there are a lot different page requests that are not yet cached.

Some of the examples:
* most of your pages cannot be cached (example: view is customer specific and most of your visitors are logged in)
* you need to vary the view based on User-Agent or some cookies and cache hit ratio is low
* there are many popular pages and traffic is more or less evenly distributed (example: products in a webshop available in many different languages)
* content in your app changes rapidly and there are new pages realy often



### Solution 2 - Using `@ngx-http-cache-control/core` 
Making HTTP calls and waiting for the response can easily become a bottleneck with Server-Side rendering. Especially if there are multiple concurrent requests to the site.

Example without caching API calls
* 5 concurrent requests per second for the same page
* for each requests, app needs to make 10 API calls to render the view
---
That's 50 HTTP calls per second, 90.000 HTTP calls per 30min

If all those API calls return Cache-Control headers and allow caching for 30 minutes, then by simply using `@ngx-http-cache-control/core` library, it would be  **10 HTTP calls per 30minutes**.

## How does it work?

HTTP specifies Cache-Control headers to levarge the performance improvement of caching. Documentation of Cache Control:
* https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching
* https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control



