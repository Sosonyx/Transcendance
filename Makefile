SHELL := /bin/sh
SRC_DIR := src/
FRONTEND_DIR := src/frontend

.PHONY: deps build run run-backend run-game clean

deps:
	docker compose up -d
	ln -sfn $(PWD)/.env $(PWD)/src/.env
	npm install --prefix $(SRC_DIR)
	npx --prefix src/ prisma generate --schema=src/prisma/schema.prisma --config=src/prisma.config.ts
	npm install --prefix $(FRONTEND_DIR)

build: deps
	mkdir -p build
	cd src/ && npx prisma db push && cd ..
	npx --prefix $(SRC_DIR) tsc -b $(SRC_DIR)tsconfig.json
	ln -sfn $(PWD)/src/node_modules $(PWD)/build/node_modules
	npm run build --prefix $(FRONTEND_DIR)

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
	rm -rf src/frontend/dist