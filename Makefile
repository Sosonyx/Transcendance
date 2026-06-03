SHELL := /bin/sh
SRC_DIR := src/

.PHONY: deps build run run-backend run-game clean

deps:
	docker compose up -d
	npm install --prefix $(SRC_DIR)
	cd src && npx prisma generate --schema=backend/prisma/schema.prisma --config=prisma.config.ts
	cd src/backend && npx prisma db push --schema=prisma/schema.prisma

build: deps
	mkdir -p build
	npx --prefix src/ tsc -b $(PWD)/src/tsconfig.json
	ln -sfn $(PWD)/src/node_modules $(PWD)/build/node_modules


run:
	cd src && node ../build/server.js


run-backend:
	cd src && node ../build/backend/server.js

run-game:
	cd src && node ../build/backend/game/server.js

clean:
	rm -rf build
	rm -rf src/node_modules

fclean: clean
	docker compose down postgres
	rm -rf src/.env
	rm -rf src/build


