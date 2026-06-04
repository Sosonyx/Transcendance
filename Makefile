SHELL := /bin/sh
SRC_DIR := src/

.PHONY: deps build run run-backend run-game clean

deps:
	docker compose build 
	sleep 3
	npm install --prefix $(SRC_DIR)
	ln -sfn $(PWD)/.env $(PWD)/src/backend/.env
	

run: deps
	docker compose up
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
	podman system prune -a
	rm -rf src/.env
	rm -rf build/backend/.env
	rm -rf src/build


