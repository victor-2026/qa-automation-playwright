#!/bin/bash
SCRIPT_DIR="$(dirname "$0")"
echo "Starting Grafana..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d
sleep 3
echo ""
echo "Grafana:  http://localhost:3003  (anonymous, Editor)"
echo ""
echo "Stop: docker compose -f $SCRIPT_DIR/docker-compose.yml down"
