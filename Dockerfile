FROM node:24-alpine AS install

WORKDIR /app

RUN apk add --no-cache git && \
    git config --global user.email "dev@example.com" && \
    git config --global user.name "dev"

COPY package*.json ./
RUN npm ci

COPY frontend/package*.json ./frontend/
RUN cd ./frontend && npm ci

COPY server ./server
COPY shared ./shared
COPY frontend ./frontend
COPY tsconfig.json esbuild.config.ts ./

RUN npm run server:build && \
    cd ./frontend && npm run build && \
    cd ../dist && npm i

FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache git && \
    git config --global user.email "dev@example.com" && \
    git config --global user.name "dev"

COPY --from=install /app/frontend/dist ./frontend/dist
COPY --from=install /app/dist/index.mjs ./dist/index.mjs
COPY --from=install /app/dist/node_modules ./node_modules
COPY theme ./theme
COPY default_email_templates ./default_email_templates
COPY migrations ./migrations

RUN git init && git add -A && git commit -m "init" || true

RUN mkdir -p /app/config /app/db

ENV DB_ADAPTER=sqlite
ENV DB_PATH=/app/db/voidauth.db

VOLUME ["/app/config"]
VOLUME ["/app/db"]

EXPOSE 3000

HEALTHCHECK CMD ["node", "-e", "\"fetch('http://localhost:'+(process.env.APP_PORT||3000)+'/healthcheck').then(r=>process.exit(r.status===200?0:1)).catch(e=>process.exit(1))\""]

ENTRYPOINT ["node", "./dist/index.mjs"]
