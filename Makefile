SHELL := /bin/sh

BACKEND_DIR := src/backend
GAME_DIR := src/game

.PHONY: help deps deps-backend deps-game build build-backend build-game run run-backend clean

help:
	@printf '%s\n' \
		"Targets:" \
		"  make deps           Install dependencies for backend and game" \
		"  make build          Compile backend and game" \
		"  make run            Launch the backend server with tsx" \
		"  make clean          Remove generated build output"

deps: deps-backend deps-game

deps-backend:
	npm install --prefix $(BACKEND_DIR)

deps-game:
	npm install --prefix $(GAME_DIR)

build: build-backend build-game

build-backend: deps-backend
	npm --prefix $(BACKEND_DIR) run build

build-game: deps-game
	npm --prefix $(GAME_DIR) run build

run: run-backend

run-backend: deps-backend
	cd $(BACKEND_DIR) && npm exec tsx server.ts

clean:
	rm -rf build