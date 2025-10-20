#!/bin/sh
set -e

COMPOSE_FILE=docker-compose.dev.yaml

docker compose -f "$COMPOSE_FILE" up -d db

docker compose -f "$COMPOSE_FILE" run --rm backend sh -lc "python -m pip install -r backend/requirements.txt && python backend/manage.py makemigrations && python backend/manage.py migrate && python backend/manage.py test --verbosity=2"
