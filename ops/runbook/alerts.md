Runbook: Common Alerts

HighRateLimitRejections
- What it means: Many requests are being rejected by rate limiters (e.g., message sends, auth attempts).
- Check:
  - Grafana: rate limit rejections panel
  - /metrics: increase(cofound_rate_limit_rejections_total[5m])
  - Logs for IP addresses and offending endpoints
- Remediation:
  1. If caused by a bot, block the offending IPs at firewall (ufw/iptables) or implement WAF rules.
  2. Temporarily relax rate limits in config (not recommended for long term).
  3. Add network-level throttling (cloud provider load balancer) and notify engineering.

LowSocketConnections
- What it means: Socket connections are extremely low, may indicate background workers crashed or memcached/redis issues.
- Check:
  - Grafana socket connections graph
  - Server logs for errors (Sentry)
  - Redis status (ping), and socket.io adapter logs
- Remediation:
  1. Check `docker ps` and service healthchecks.
  2. Restart app service: `sudo systemctl restart cofound` or `docker compose -f docker-compose.prod.yml restart app`.
  3. Check Redis and DB health; if degraded, restart or failover to replicas.

HighHttpErrors
- What it means: Many 5xx errors from the server
- Check:
  - Grafana: HighHttpErrors alert and request 5xx charts
  - Server logs (journald / Docker logs) and Sentry events
- Remediation:
  1. Identify stack trace and urgency (Sentry).
  2. If memory pressure, OOM killed processes, or DB timeouts, consider scaling up or restarting the service.
  3. Patch the exception and redeploy; if needed roll back to last known good release.

DB degraded / backups failing
- What it means: /api/health shows DB degraded or nightly backup restore failed
- Check:
  - `docker exec cofound_db pg_isready` and `psql` connectivity
  - Verify disk usage and available backups
- Remediation:
  1. If disk is full, free space or attach additional volume and restore backups as needed.
  2. Restore from last good backup to a new instance and verify app read-only mode if necessary.

Escalation
- If you can't restore service within 30 minutes, escalate to on-call and open an incident (document actions and timestamps).
