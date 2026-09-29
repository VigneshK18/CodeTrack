# CodeTrack Java API: Node.js + Express, plus a JDK so the server can compile and run Java submissions.
# Build from the repository root:  docker build -f backend/Dockerfile -t codetrack-api .
FROM node:22-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends openjdk-17-jdk-headless \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package.json backend/package-lock.json backend/
RUN cd backend && npm ci --omit=dev

COPY backend backend
COPY database database

WORKDIR /app/backend
ENV NODE_ENV=production \
    PORT=8080
EXPOSE 8080

# Run as the unprivileged "node" user that ships with the image.
USER node
CMD ["node", "src/server.js"]
