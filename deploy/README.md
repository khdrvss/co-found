Before you deploy the app to a production VPS please review these operational recommendations.

1) Secrets & Environment

- Create an environment file at `/etc/cofound/env` with the variables listed in `.env.production.example`.
- Use a secrets manager (HashiCorp Vault, AWS Secrets Manager, or the server's OS-level secrets) whenever possible. Do NOT commit secret values to the repository.

2) Running with systemd

- Ensure Docker and Docker Compose are installed on the host.
- Create a systemd unit using the provided template at `deploy/systemd/cofound.service` and ensure the `WorkingDirectory` and `EnvironmentFile` paths match your installation.
- Enable and start:

  sudo systemctl daemon-reload
  sudo systemctl enable cofound
  sudo systemctl start cofound

- Check logs:

  sudo journalctl -u cofound -f

3) DNS / TLS

- Point both the apex/root domain and `www` to your VPS IP address:
  - A record: `co-found.uz` -> <VPS_IP>
  - CNAME (or A): `www.co-found.uz` -> `co-found.uz` (or `www` A record to the same IP)
- When Traefik runs on your VPS it will use the ACME HTTP challenge to obtain certificates — ensure port 80 is reachable from the internet.
- After DNS propagation, Traefik will provision TLS certificates for both `co-found.uz` and `www.co-found.uz`.

4) Google OAuth

- Update your Google Cloud OAuth redirect URIs to include your production domain:
  - https://co-found.uz/auth/google/callback
  - https://www.co-found.uz/auth/google/callback

5) Health Checks & Process Management

- docker-compose.prod.yml already includes a healthcheck for the `app` service at `/api/health`.
- Use `Restart=always` in the systemd unit or Docker `restart: unless-stopped`.
- Configure an external process supervisor or orchestration platform if you need automatic scaling.

6) Backups & Restore

- There is a GitHub Actions workflow that performs a nightly backup & restore verification (`.github/workflows/db-backup.yml`). Add the repository secret `SLACK_WEBHOOK` to receive notifications about backup success/failure in Slack.
- Optionally, configure S3 upload by adding the following repository secrets: `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.
- The workflow will upload the backup to S3 under the bucket path `s3://<bucket>/<YYYY-MM-DD>/backup-*.sql` when secrets are present.

7) Monitoring & Alerts

- Start the monitoring stack (optional) with `docker compose -f monitoring/docker-compose.yml up -d`.
- Configure Alertmanager with a Slack webhook and email settings in `monitoring/alertmanager/config.yml` (use Docker secrets to inject credentials).
- Import the Grafana dashboard at `monitoring/grafana/cofound-dashboard.json`.

8) Load Testing

- A basic k6 load test is available at `tests/k6/conversation.js` and can be run locally with `k6 run tests/k6/conversation.js -e TARGET=http://localhost:5000`.
- Use the provided GitHub Actions job (`.github/workflows/load-test.yml`) to run weekly or on demand.

9) Runbook

- See `ops/runbook/alerts.md` for quick remediation steps for common alerts.

10) Scheduling on-host backups

- If you prefer to run backups on the VPS itself (in addition to the GitHub Actions workflow), you can add a crontab entry for the `cofound` user. See `deploy/cron/backup-cron.example` for an example that runs nightly at 01:00 and stores logs under `/var/log/cofound/`.

Notes

- By default we configure a redirect from `www` to `co-found.uz` so your canonical site is the non-www domain. If you prefer `www` as the canonical host, I can swap the redirect.
- Remember to set `LETSENCRYPT_EMAIL` in your production env file and ensure `acme.json` is writable by the Traefik process (on your VPS run: `chmod 600 monitoring/traefik/acme.json`).

If you want, I can automatically provision systemd files, install the monitoring stack on a target VPS via an Ansible playbook, or add additional automation for rotating backups to S3. What should I do next?
