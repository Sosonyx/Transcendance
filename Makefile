SHELL := /bin/sh
SRC_DIR := src/
FRONTEND_DIR := src/frontend

.PHONY: deps build run run-backend run-game clean

deps:
	docker compose build

run: deps
	docker compose up

data-clean :
	docker compose down -v

fclean:
	docker compose down postgres transcendence_backend_1 frontend
# 	podman system prune -a

re: fclean run
