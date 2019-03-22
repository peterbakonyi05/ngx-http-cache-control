# TODOS

## Architecture
* Can it be implemented at a redux level connecting it with ngrx?

## Chore
* ~~setup GIT repo~~
* ~~clean skeleton~~
* setup Cicle CI pipeline
* setup Renovate
* test release process and release npm package
* publish documentation

## Documentation
* Add root README
* Add root CHANGELOG
* Add CONTRIBUTING

## Core
* ~~Create dummy cache interceptor with empty unit tests~~
* ~~Create implementation that has basic caching~~
* ~~Make sure interceptor is singleton for all apps~~
* ~~Add storage interface with in memory storage~~
* Add Cache-Control header parse
    * support `max-age` first: number of seconds response can be cached
    * support `no-cache`: use Etag to check, so there is a round trip but network traffic can be skipped
    * support `no-store`: do not cache at all
    * support `public`:
         * can be cached, if if status code is normally not cache-able or authentication is associated with it
    * support `private`: interceptor shouldn't cache since it can be different by each user
* Add support for Etag, 304, If-None-Match logic
* Add support for Vary headers
* Check edge-cases
    * security and authentication
    * which status codes can be cached, which cannot?
    * max-age invalid values
* Write core README
* Publish beta
* Future improvements
    * add blacklisting of urls with glob pattern?
    * support logging maybe with events?
    * sharing ongoing requests before first response arrives
        * minimal gain but can cause issues (what happens if a request is shared that shouldn't have been shared?)

## Redis
* Write redis README
* Create redis storage
* Investigate what options need to be published
* Publish beta