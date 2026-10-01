---
title: Magic variables
description: Built-in dynamic variables - UUID, timestamp, date, and random integers.
created: '2026-06-10'
categories:
  - examples
  - guides
  - reference
published: true
---

Magic variables are generated fresh on each substitution. They start with `$` and are referenced inside `{{ }}`.

| Variable            | Description                   |
| ------------------- | ----------------------------- |
| `{{$uuid}}`         | Random UUID                   |
| `{{$random.uuid}}`  | Alias for UUID                |
| `{{$timestamp}}`    | Unix timestamp (milliseconds) |
| `{{$isoTimestamp}}` | ISO-8601 timestamp            |
| `{{$date}}`         | Current date (`yyyy-MM-dd`)   |
| `{{$randomInt}}`    | Random integer (0-1000)       |

## Example

Use them in headers, URLs, or JSON bodies:

```http path=magic-variables.http
POST https://echo.kulala.app/post HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "uuid": "{{$uuid}}",
  "timestamp": "{{$timestamp}}",
  "date": "{{$date}}",
  "randomInt": "{{$randomInt}}"
}
```

Multipart boundaries often combine a static prefix with `$timestamp`:

```http path=multipart-boundary.http
POST https://echo.kulala.app/post HTTP/1.1
Content-Type: multipart/form-data; boundary=boundary-{{$timestamp}}

--boundary-{{$timestamp}}
Content-Disposition: form-data; name="first"; filename="multipart-form-data.txt"

< ./multipart-form-data.txt
--boundary-{{$timestamp}}--
```
