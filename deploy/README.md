# Deploying Mimir on the home server

Pull-based deploy: the server polls `origin/main` every ~2 minutes and, when it
moves, hard-resets to it and rebuilds the Docker stack. Nothing connects *into*
the laptop — it only reaches *out* to GitHub, so it works behind the
zero-inbound-ports Cloudflare Tunnel.

```
push to main (from anywhere)
        │
        ▼
   GitHub origin/main
        ▲   launchd timer polls outbound every 120s
        │
  scripts/deploy.sh ── git reset --hard origin/main
                       docker compose up -d --build
```

## One-time server setup

1. **Clone over HTTPS** (public repo → no SSH key needed, which matters because
   launchd can't reach your SSH agent):

   ```bash
   git clone https://github.com/svennif/mimir.git ~/dev/mimir
   cd ~/dev/mimir
   ```

2. **Create `.env`** (it is gitignored and per-machine — it does not come with
   the clone). Copy `.env.example` and fill every value. Generate fresh secrets
   on the server; do NOT reuse the dev laptop's:

   ```bash
   cp .env.example .env
   openssl rand -hex 24     # POSTGRES_PASSWORD  (also put in DATABASE_URL)
   openssl rand -base64 32  # SESSION_SECRET
   # APP_PASSWORD_HASH_B64:
   node -e "console.log(Buffer.from(require('bcrypt').hashSync('YOUR_PASSWORD',10)).toString('base64'))"
   ```

3. **First deploy by hand** to confirm the stack builds and the tunnel comes up:

   ```bash
   npm run prod:up      # docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
   ```

4. **Install the auto-deploy timer:**

   ```bash
   mkdir -p ~/Library/Logs
   # Edit the three CHANGE paths in the plist to match this server first:
   cp deploy/com.mimir.deploy.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.mimir.deploy.plist
   ```

   `RunAtLoad` makes it run once immediately, then every 120s.

## Everyday use

- **Deploy** = just `git push` to `main` from any machine. Within ~2 min the
  server pulls and rebuilds. No SSH into the server required.
- **Watch the log:** `tail -f ~/Library/Logs/mimir-deploy.log`
- **Force a deploy now:** `bash ~/dev/mimir/scripts/deploy.sh`
- **Pause auto-deploy:** `launchctl unload ~/Library/LaunchAgents/com.mimir.deploy.plist`
- **Resume:** `launchctl load ~/Library/LaunchAgents/com.mimir.deploy.plist`

## Known gaps

- **DB migrations run automatically.** The one-shot `migrate` service applies
  pending migrations after Postgres is healthy. The app only starts when the
  migration exits successfully.
- **A broken `main` will be deployed.** Polling deploys whatever is on `main`,
  even if it doesn't build/run. Keep `main` releasable, or add a CI check.
