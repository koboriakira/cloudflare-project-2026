#!/bin/bash
set -euo pipefail

echo "Resetting local D1 database (DB)..."
npx wrangler d1 migrations apply DB --local

echo "Done."
