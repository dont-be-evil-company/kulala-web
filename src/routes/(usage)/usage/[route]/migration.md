---
title: Migration from older Kulala docs
description: Breaking changes and compatibility flags when moving from kulala.nvim docs to kulala-core.
created: '2026-06-10'
categories:
  - guides
  - migration
published: true
---

This guide lists differences verified against the current kulala-core parser
and the 5x implemention in kulala.nvim:

## Curl operator prefix

**Old (kulala.nvim docs):**

```text
# @curl-insecure
# @curl-location
# @curl-compressed
```

**Current (kulala-core):**

```text
# @kulala-curl--insecure
# @kulala-curl--location
# @kulala-curl--compressed
```

Use `kulala-curl--` plus the curl long-option name (double dash). Short flags use a single dash: `// @kulala-curl-k`. The old `@curl-*` operators are **not** recognized by kulala-core.

See [Operators and curl flags](/usage/operators).

## System environment variables

**Old / incorrect:**

```json
{ "user": "{{USER}}" }
```

**Current (JetBrains-compatible):**

```json
{ "user": "{{ $env.USER }}" }
```

System environment variables are only available under the `$env.` prefix. Variables from `http-client.env.json` still use plain `{{API_URL}}`.

See [Environments](/usage/environments).

## VS Code REST Client request chaining

**Required compat flag** when using `{{RequestName.response.body…}}` syntax from the VS Code REST Client extension:

```text
# @kulala-vscode-restclient-compat
```

Without this flag, request-variable references resolve to empty strings. Kulala persists named-request responses in SQLite so chaining works across separate runs.

See [Request variables](/usage/request-variables).

## Global headers across one-by-one runs

**JetBrains / old `client.global.headers.set`:** only applies when running all requests in one flow.

**Kulala extension:**

```javascript
$kulala.client.global.headers.set('X-Kulala', 'Family');
```

See [Variables](/usage/variables#global-headers-across-requests).

## Prompt operator

**Old / incorrect:**

```text
// @prompt NAME
```

**Current (JetBrains-compatible still doesn't support prompts):**

```text
// @kulala-prompt "What is your name?" NAME
```

## WebSocket method name

**Old docs:** `WS` / `WSS` as HTTP methods.

**Current:** `WEBSOCKET wss://host/path` with the scheme in the URL.

See [WebSockets](/usage/websockets).

## What stayed the same

Most JetBrains HTTP Client syntax ports directly:

- `###` delimiters and named requests
- `@var=value` document variables
- `< ./file` body from file, `>>` / `>>!` response to file
- `import` / `run` / `run #NAME (@var=value)`
- `### KULALA_SHARED` / `KULALA_SHARED_EACH`
- `client.test` / `client.assert` testing API
- GraphQL, gRPC, multipart (including IntelliJ inline `Text` parts)
- OAuth `{{$auth.token("profile")}}`

All examples on this site are available [here](https://github.com/dont-be-evil-company/kulala-web/tree/main/src/static/examples), [here](https://kulala.app/examples) and verified against the current kulala-core parser.
