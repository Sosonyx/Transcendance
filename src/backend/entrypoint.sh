#!/bin/sh
npx prisma db push --schema=backend/prisma/schema.prisma
npx prisma studio --port 5555 --browser none --schema=backend/prisma/schema.prisma &
exec node build/backend/server.js
