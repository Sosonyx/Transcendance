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

db-push:
	npx prisma db push --schema=src/prisma/schema.prisma --dotenv=.env

db-studio:
	npx prisma studio --schema=src/prisma/schema.prisma --url=$(DATABASE_URL)

deps-root:
	ln -sfn $(PWD)/.env $(PWD)/src/.env
	npm install --prefix $(SRC_DIR)
	npx --prefix src/ prisma generate --schema=src/prisma/schema.prisma --config=src/prisma.config.ts
	
build: deps-root
	mkdir -p build
	npx --prefix $(SRC_DIR) tsc -b $(SRC_DIR)tsconfig.json
	ln -sfn $(PWD)/src/node_modules $(PWD)/build/node_modules

run:
	node build/server.js


run-backend:
	node build/backend/server.js

run-game:
	node build/game/server.js

clean:
	rm -rf src/.env
	rm -rf build
	rm -rf src/node_modules