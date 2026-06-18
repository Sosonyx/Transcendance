SHELL := /bin/sh
SRC_DIR := src/
FRONTEND_DIR := src/frontend

.PHONY: deps build run run-backend run-game clean dev

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
	docker compose down -v

re: clean run
