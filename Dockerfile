# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy workspace config and lockfile
COPY package.json yarn.lock ./
COPY server/package.json server/
COPY client/package.json client/

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY server/ server/
COPY client/ client/

# Build server and client
RUN yarn build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy workspace config
COPY package.json yarn.lock ./
COPY server/package.json server/

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy build artifacts
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/client/dist client/dist

EXPOSE 3000

CMD ["node", "server/dist/index.js"]
