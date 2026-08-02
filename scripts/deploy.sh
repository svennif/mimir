#!/usr/bin/env bash
#
# scripts/deploy.sh — pull-based deploy for the Mimir home server.
#
# Polls origin/main; when it moves, hard-resets the working tree to match and
# rebuilds the Docker stack. Designed to be run repeatedly by launchd (macOS)
# or cron every minute or two — it exits immediately when already up to date,
# so running it often is cheap.
#
# Only needs `git` and `docker`. It calls `docker compose` directly instead of
# `npm run prod:up`, so it does NOT depend on node/nvm being on launchd's PATH.
#
# NOTE: .env is gitignored, so `git reset --hard` never touches it. This script
# deliberately does NOT run `git clean` — that would delete your .env.
#
set -euo pipefail

# launchd/cron run with a minimal environment — make paths explicit.
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
# Docker Desktop on macOS listens on a per-user socket.
export DOCKER_HOST="${DOCKER_HOST:-unix://${HOME}/.docker/run/docker.sock}"

BRANCH="main"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*"; }

# --- single-instance lock (a slow build must not overlap the next tick) ---
LOCKDIR="/tmp/mimir-deploy.lock"
# Clear a stale lock left behind by a killed run (older than 30 min).
if [ -d "$LOCKDIR" ] && find "$LOCKDIR" -maxdepth 0 -mmin +30 2>/dev/null | grep -q .; then
  log "removing stale lock"
  rmdir "$LOCKDIR" 2>/dev/null || true
fi
if ! mkdir "$LOCKDIR" 2>/dev/null; then
  exit 0   # another deploy already in progress
fi
trap 'rmdir "$LOCKDIR" 2>/dev/null || true' EXIT

# --- check for new commits on main ---
git fetch --quiet origin "$BRANCH"
LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH")"
if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0   # already up to date, nothing to do
fi

log "deploying ${LOCAL:0:7} -> ${REMOTE:0:7}"
git reset --hard "origin/$BRANCH"

# Rebuild + recreate the stack. The db volume persists; the app image is rebuilt
# with the new code, pulling build args / env from .env via the compose files.
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

log "deploy complete: now at ${REMOTE:0:7}"
