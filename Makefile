SHELL := /bin/sh
SRC_DIR := src/
FRONTEND_DIR := src/frontend

.PHONY: deps build run run-backend run-game clean

deps:
	npm install --prefix $(SRC_DIR)
	npm install --prefix $(SRC_DIR)frontend
	docker compose build --no-cache

run: deps
	docker compose up

clean:
	rm -rf build
	rm -rf src/node_modules

data-clean :
	docker compose down -v

fclean: clean
	docker compose down postgres transcendence_backend_1 frontend
# 	podman system prune -a
	rm -rf src/.env
	rm -rf build/backend/.env
	rm -rf src/build
	rm -rf src/frontend/dist


re: fclean run
