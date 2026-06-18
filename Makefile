SHELL := /bin/sh
SRC_DIR := src/
FRONTEND_DIR := src/frontend

.PHONY: deps build run run-backend run-game clean dev

all: set-ip run

set-ip:
	@IP=$$(hostname -I | awk '{print $$1}') && \
	if grep -q "^IP_ADD=" .env 2>/dev/null; then \
		sed -i "s/^IP_ADD=.*/IP_ADD=\"$$IP\"/" .env; \
	else \
		echo "IP_ADD=\"$$IP\"" >> .env; \
	fi && \
	echo "IP_ADD set to $$IP"

deps:
	docker compose build --no-cache

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

run: deps
	docker compose up -d

run-logs: deps
	docker compose up

stop:
	docker compose stop

start:
	docker compose start

clean: stop
	docker compose down

fclean:
	docker compose down -v --rmi all

re: clean run
