# Mimir

A Notion Clone to store notes on a selfhosted platform (or online if you want)

A single-user, self-hostable notes app. Block-based editor, nested pages, full-text search, and no accounts to manage — one password, your data, your hardware (or your cloud, if you prefer).

Built with Next.js, BlockNote, Drizzle, and Postgres. Runs in Docker on a laptop in a closet, or on Vercel with a hosted database. The codebase makes no assumption about which.

## Database migrations

Docker deployments run pending migrations automatically before starting the
app. If a migration fails, the app is not started.

For hosted databases, run migrations separately before deploying a release:

```bash
DATABASE_DIRECT_URL="postgresql://..." npm run db:migrate
```

`DATABASE_DIRECT_URL` is optional. If it is not set, the migration command uses
`DATABASE_URL`. Prefer a direct database connection for migrations and a pooled
connection for serverless application traffic.

## Hosted database connections

Set `DATABASE_URL` to the provider's pooled connection string when deploying to
Vercel. The database client uses one connection per Vercel function instance,
closes idle connections after 20 seconds, and disables prepared statements by
default so Supabase's transaction pooler works without additional settings.
Neon pooled and ordinary Postgres connection strings are supported as well.

For unusual deployments, `DATABASE_MAX_CONNECTIONS` overrides the connection
limit. Set `DATABASE_PREPARED_STATEMENTS=true` only when the selected endpoint
supports prepared statements.

## The rest is coming later

## License

[MIT](/LICENSE)
