SHELL := /bin/sh

.PHONY: help deps build build-backend build-game run run-backend clean fclean distclean

help:
	@printf '%s\n' \
		"Targets:" \
		"  make deps           Install all workspace dependencies" \
		"  make build          Compile the monorepo" \
		"  make run            Launch the main server with tsx" \
		"  make run-backend    Launch only the backend workspace" \
		"  make clean          Remove generated build output" \
		"  make fclean         Remove generated build output and Prisma artifacts" \
		"  make distclean      Remove build output and all node_modules"

deps:
	npm install

build:
	make build-frontend
	make build-backend
	make build-game

build-frontend:
	npm run build

build-backend:
	docker compose up -d
	npm run build --workspace src/backend

build-game:
	npm run build --workspace src/game

run:
	make deps
	make build
	npm run dev

run-backend:
	npm run dev --workspace src/backend

clean:
	rm -rf build
	rm -f tsconfig.tsbuildinfo
	rm -rf src/backend/.prisma

fclean: clean

distclean: fclean
	rm -rf node_modules
	rm -rf src/backend/node_modules
	rm -rf src/game/node_modules
	rm -rf src/backend/llm/node_modules