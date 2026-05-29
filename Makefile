SHELL := /bin/sh
LLM_DIR := src/backend/llm
BACKEND_DIR := src/backend
GAME_DIR := src/game

.PHONY: help deps deps-backend deps-game build build-backend build-game run run-backend run-game clean

help:
	@printf '%s\n' \
		"Targets:" \
		"  make deps           Install dependencies for backend and game" \
		"  make build          Compile backend and game" \
		"  make run            Launch the backend server with tsx" \
		"  make run-game       Launch the game server" \
		"  make clean          Remove generated build output"

deps: deps-backend deps-game

deps-root:
	npm install

deps-backend:
	npm install --prefix $(BACKEND_DIR)

deps-game:
	npm install --prefix $(GAME_DIR)

build: deps-root build-backend build-game

build-backend: deps-backend
	npm --prefix $(BACKEND_DIR) run build
	mkdir -p build/backend
	ln -sfn ../../src/backend/node_modules build/backend/node_modules

build-game: deps-game
	npm --prefix $(GAME_DIR) run build
	mkdir -p build/game
	ln -sfn ../../src/game/node_modules build/game/node_modules

run: run-backend

run-llm:
	npm run chat --prefix $(LLM_DIR)

run-backend: deps-backend
	node build/backend/server.js

run-game: deps-game
	node build/game/server.js

clean:
	rm -rf build