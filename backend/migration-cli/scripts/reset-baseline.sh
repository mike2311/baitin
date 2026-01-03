#!/bin/bash

# Reset Baseline Script
# Wrapper script for resetting PoC database to baseline dataset

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check environment
if [ "$ENV" != "POC" ] && [ "$NODE_ENV" != "POC" ]; then
  echo "ERROR: ENV must be set to 'POC'"
  echo "Current ENV: ${ENV:-not set}"
  exit 1
fi

echo "Resetting database to baseline..."
cd "$CLI_DIR"

npm run reset -- --confirm

echo "Reset completed successfully"


