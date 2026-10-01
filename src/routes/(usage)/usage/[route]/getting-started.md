---
title: Getting started with Kulala
description: How to get started with Kulala HTTP files - basic requests, naming, and where to go next.
created: '2026-06-06'
categories:
  - getting-started
  - examples
  - guides
  - how-to
published: true
---

Kulala uses `.http` files to describe API requests. Each file can hold one or many requests, separated by `###` delimiters. You can name a request by placing text after the delimiter - that name is used for scripting, import/run, and request chaining.

## Your first request

A minimal GET request needs only a method and URL:

```http path=simple-get.http
GET https://echo.kulala.app/get HTTP/1.1
```

A POST with a JSON body looks like this:

```http path=simple-post.http
POST https://echo.kulala.app/post HTTP/1.1
Content-Type: application/json

{
  "message": "Hello, Kulala!"
}
```

## Named requests

Prefix a delimiter with a name to identify the request later:

```http path=named-request.http
### NAMED_SIMPLE

POST https://echo.kulala.app/post HTTP/1.1
X-Custom-Header: Kulala-Named-Request

{
  "message": "Hello, Kulala!"
}
```

## Comments and query parameters

Lines starting with `#` are comments. Query parameters can span multiple lines and include inline comments:

```http path=query-params.http
POST https://echo.kulala.app/post
  ?someKey=someValue1
  # &someKey2=someValue2
  &someKey3=someValue3
  HTTP/1.1
Content-Type: application/json

{
  "username": "user123"
}
```

## What to read next

- [HTTP file format](/usage/http-file-format) - request line formats, HTTP versions, implicit first request
- [Variables](/usage/variables) - `@var=value`, prompts, JSONPath iteration
- [Environments](/usage/environments) - `http-client.env.json`, system env, Kuba
- [Request variables](/usage/request-variables) - chaining responses between named requests
- [Operators and curl flags](/usage/operators) - timeouts, cookie jar, `@kulala-curl--*` passthrough
- [Scripting](/usage/scripting) - pre/post-request JavaScript and Lua
- [Migrating from older Kulala docs](/usage/migration) - `@curl-*`, plain `{{USER}}`, VS Code REST Client compat

All examples on this site are available [here](https://github.com/dont-be-evil-company/kulala-web/tree/main/src/static/examples), [here](https://kulala.app/examples) and verified against the current kulala-core parser.
