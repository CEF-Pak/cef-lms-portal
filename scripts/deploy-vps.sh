#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="cefportal"
REMOTE_HOST="72.61.96.57"
REMOTE_DIR="/home/cefportal/htdocs/vps-portal.cefonlineacademy.com"
SSH_KEY="$HOME/.ssh/cef_vps_deploy"

echo "Building portal..."
npm run build

echo "Clearing previous VPS build..."
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" \
  "find '$REMOTE_DIR' -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +"

echo "Uploading new build..."
tar -C dist -czf - . | \
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" \
  "tar -xzf - -C '$REMOTE_DIR'"

echo "Portal deployed successfully."
