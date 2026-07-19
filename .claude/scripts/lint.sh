#!/bin/bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
npx @biomejs/biome check src/
