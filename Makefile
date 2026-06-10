SHELL := /bin/sh
SRC_DIR := src/
FRONTEND_DIR := src/frontend

.PHONY: deps build run run-backend run-game clean dev

deps:
	docker compose build

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

run:deps
	docker compose up -d

run-logs:
	docker compose up

stop:
	docker compose stop

start:
	docker compose start

clean:
	docker compose down

fclean:
	docker compose down -v

re:clean run
