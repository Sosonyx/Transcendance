SHELL := /bin/sh
LLM_DIR := src/backend/llm
SRC_DIR := src/
BACKEND_DIR := src/backend
GAME_DIR := src/game

.PHONY: help deps db-push db-studio deps-root build run run-backend run-game clean

help:
	@printf '%s\n' \
		"Targets:" \
		"  make deps-root      Install dependencies and generate Prisma client" \
		"  make build          Compile the whole project (including src/server.ts)" \
		"  make run            Launch the main root server" \
		"  make run-backend    Launch the backend server" \
		"  make run-game       Launch the game server" \
		"  make clean          Remove generated build output"

deps: deps-root deps-backend deps-game 

deps-root:
	npm i

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
	node build/game/src/game/server.js

clean:
	rm -rf src/.env
	rm -rf build
	rm -rf node_modules 
	rm -rf $(BACKEND_DIR)/node_modules
	rm -rf $(GAME_DIR)/node_modules
