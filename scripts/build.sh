#!/usr/bin/env bash

set -eo pipefail

pnpm install --frozen-lockfile

pnpm run build
