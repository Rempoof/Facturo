# Deployment — Facturo (VPS / Forge / Coolify)

## 1. Server baseline
- Ubuntu 24.04, PHP 8.3 (fpm) + extensions `pgsql, redis, mbstring, intl, gd, bcmath`.
- PostgreSQL 16, Redis 7, Nginx, Node 22 (build only), Supervisor.
- TLS via Let's Encrypt (`certbot --nginx`), HSTS on, HTTP/2.

## 2. Release pipeline (GitHub Actions → Coolify/VPS)
```yaml
deploy:
  steps:
    - composer install --no-dev --optimize-autoloader
    - npm ci && npm run build
    - php artisan migrate --force
    - php artisan config:cache && php artisan route:cache && php artisan view:cache
    - php artisan horizon:terminate      # graceful worker reload
    - php artisan queue:restart
```
Run `migrate` *before* `horizon:terminate` so workers never boot on a stale schema.

## 3. Supervisor / Horizon
```ini
[program:facturo-horizon]
command=php /var/www/facturo/artisan horizon
autostart=true
autorestart=true
user=www-data
stopwaitsecs=3600
```
Horizon supervisors: `supervisor-pdf` (queue `pdf`, 2 processes), `supervisor-default`
(3 processes), `supervisor-mails` (queue `default`, auto-scale 1–5).
Retries: PDF 3× / timeout 120 s; e-mails 5× backoff `[30, 120, 600]`.

## 4. Scheduler
```cron
* * * * * www-data cd /var/www/facturo && php artisan schedule:run >> /dev/null 2>&1
```
Scheduled: nightly overdue flagging, `facturo:ceiling-alert` (08:30 Africa/Casablanca),
`horizon:snapshot` every 5 minutes.

## 5. Backups & recovery
- Nightly `pg_dump --format=custom` → encrypted object storage (30-day retention, monthly archive 12 months).
- Weekly restore drill into staging; RPO 24 h, RTO < 2 h.
- `storage/app/documents` (PDF archive) synced daily with `rclone`.

## 6. Observability
- **GlitchTip** (Sentry-compatible) for exceptions, `LOG_CHANNEL=stderr`.
- **Uptime Kuma** monitors `/up`, `/login`, and Horizon's `/horizon` (auth-protected).
- Alerts on failed jobs > 0, queue wait > 60 s, disk > 80 %, backup missing > 26 h.

## 7. Security hardening
- `APP_DEBUG=false`, `SESSION_SECURE_COOKIE=true`, `SameSite=Lax`, Redis password + private bind.
- 2FA enforced for owners; password policy `min(12)->uncompromised()`; rate limits on issuing documents.
- Signed PDF URLs; documents are private (`storage/app`) and streamed through the controller.
