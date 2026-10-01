#!/usr/bin/env bash

set -eo pipefail

pnpm install --frozen-lockfile

# Measure build time
start_time=$(date +%s)
vp build > /dev/null
svelte-sitemap > /dev/null
node scripts/generate-examples-index.mjs
end_time=$(date +%s)
build_time=$((end_time - start_time))
echo "Build completed in $build_time seconds."
