#!/bin/bash
# Production deployment script for co-found
# Usage: ./deploy.sh [deploy|update|status|logs|backup]

set -euo pipefail

PROJECT_DIR="/opt/docker/co-found"
COMPOSE_FILE="docker-compose.prod.yml"

cd "$PROJECT_DIR" || { echo "Error: Cannot access $PROJECT_DIR"; exit 1; }

case "${1:-deploy}" in
  deploy)
    echo "=== Deploying co-found application ==="
    
    # Validate compose file
    echo "Validating docker-compose.prod.yml..."
    docker compose -f "$COMPOSE_FILE" config > /dev/null
    
    # Create volumes if they don't exist
    echo "Creating named volumes..."
    docker volume create co-found-postgres-data 2>/dev/null || true
    docker volume create co-found-redis-data 2>/dev/null || true
    docker volume create co-found-app-uploads 2>/dev/null || true
    docker volume create co-found-traefik-acme 2>/dev/null || true
    
    # Pull images (if using registry)
    echo "Pulling images..."
    docker compose -f "$COMPOSE_FILE" pull || echo "Warning: Some images may need to be loaded manually"
    
    # Start services
    echo "Starting services..."
    docker compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    echo "Waiting for services to be healthy..."
    sleep 10
    
    # Show status
    docker compose -f "$COMPOSE_FILE" ps
    ;;
    
  update)
    echo "=== Updating application ==="
    echo "IMPORTANT: Update image tag in docker-compose.prod.yml first!"
    read -p "Press Enter to continue or Ctrl+C to cancel..."
    
    SERVICE="${2:-app}"
    echo "Updating service: $SERVICE"
    
    docker compose -f "$COMPOSE_FILE" stop "$SERVICE"
    docker compose -f "$COMPOSE_FILE" rm -f "$SERVICE"
    docker compose -f "$COMPOSE_FILE" pull "$SERVICE" || echo "Warning: Image may need to be loaded manually"
    docker compose -f "$COMPOSE_FILE" up -d "$SERVICE"
    
    echo "Service $SERVICE updated. Checking status..."
    docker compose -f "$COMPOSE_FILE" ps "$SERVICE"
    ;;
    
  status)
    echo "=== Service Status ==="
    docker compose -f "$COMPOSE_FILE" ps
    echo ""
    echo "=== Resource Usage ==="
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    ;;
    
  logs)
    SERVICE="${2:-}"
    if [ -z "$SERVICE" ]; then
      docker compose -f "$COMPOSE_FILE" logs -f
    else
      docker compose -f "$COMPOSE_FILE" logs -f "$SERVICE"
    fi
    ;;
    
  backup)
    BACKUP_DIR="$PROJECT_DIR/backups"
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"
    
    echo "=== Creating database backup ==="
    docker compose -f "$COMPOSE_FILE" exec -T db pg_dump -U postgres cofound_prod > "$BACKUP_FILE"
    echo "Backup created: $BACKUP_FILE"
    ;;
    
  stop)
    echo "=== Stopping all services ==="
    docker compose -f "$COMPOSE_FILE" stop
    ;;
    
  start)
    echo "=== Starting all services ==="
    docker compose -f "$COMPOSE_FILE" start
    ;;
    
  restart)
    echo "=== Restarting all services ==="
    docker compose -f "$COMPOSE_FILE" restart
    ;;
    
  *)
    echo "Usage: $0 {deploy|update|status|logs|backup|stop|start|restart}"
    echo ""
    echo "Commands:"
    echo "  deploy   - Initial deployment (creates volumes, starts services)"
    echo "  update   - Update a service (usage: ./deploy.sh update <service-name>)"
    echo "  status   - Show service status and resource usage"
    echo "  logs     - Show logs (usage: ./deploy.sh logs [service-name])"
    echo "  backup   - Create database backup"
    echo "  stop     - Stop all services"
    echo "  start    - Start all services"
    echo "  restart  - Restart all services"
    exit 1
    ;;
esac
