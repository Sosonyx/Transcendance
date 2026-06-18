#!/bin/sh
npx prisma db push --schema=backend/prisma/schema.prisma
exec node build/backend/server.js
