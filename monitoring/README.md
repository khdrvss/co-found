Grafana dashboard for Co-found realtime metrics

### Provisioned Grafana Dashboard & Alerts

This monitoring stack auto-provisions the Prometheus datasource and the "Co-found Realtime Dashboard".

Start the stack:

```bash
# from repo root
docker compose -f monitoring/docker-compose.yml up -d
```

Grafana will be available at http://localhost:3000 (admin/admin). The Co-found dashboard is automatically loaded via the provisioning files. Alertmanager is available at http://localhost:9093 (no auth by default).

You can tweak the alerting rules in `monitoring/prometheus.rules.yml` and reload Prometheus or restart the container.

How to import:
1. Start monitoring stack: `docker compose -f monitoring/docker-compose.yml up -d`
2. Open Grafana: http://localhost:3000 (admin/admin)
3. Add Prometheus data source pointing to http://prometheus:9090
4. Go to Dashboards -> Import -> Upload `cofound-dashboard.json`

You can also provision dashboards via the `grafana/provisioning` folder if you run a production Grafana image.

Dashboard file: `monitoring/grafana/cofound-dashboard.json`

## Configure Alertmanager (Slack / Email)

The `monitoring/alertmanager/config.yml` includes example receivers for Slack and email. For Slack, set the `api_url` to your incoming webhook. In production, you should inject the webhook via Docker secrets or an environment-managed template.

Example using a file secret (docker-compose):

- Create a secret file: `/etc/alertmanager/slack_webhook` containing your webhook URL
- Mount it into the container and reference it in your config

If you use the monitoring stack provided here, update `monitoring/alertmanager/config.yml` and restart Alertmanager.

## Nightly Backups

There is a GitHub Actions workflow that performs a nightly backup & restore verification (`.github/workflows/db-backup.yml`). Add the repository secret `SLACK_WEBHOOK` to receive notifications about backup success/failure in Slack.

To run the monitoring stack:

```bash
# from repo root
docker compose -f monitoring/docker-compose.yml up -d
```

Grafana: http://localhost:3000 (admin/admin)
Alertmanager: http://localhost:9093
Prometheus: http://localhost:9090
