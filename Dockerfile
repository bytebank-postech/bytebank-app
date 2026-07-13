# syntax=docker/dockerfile:1
FROM node:22-alpine AS base

WORKDIR /app
RUN corepack enable

FROM base AS dependencies

COPY package.json yarn.lock .yarnrc.yml ./
COPY apps ./apps
COPY packages ./packages
RUN yarn install --immutable

FROM dependencies AS builder

ARG APP_NAME
ARG MFE_HOME_URL
ARG MFE_TRANSACTIONS_URL
ARG MFE_AUTH_URL

ENV MFE_HOME_URL=$MFE_HOME_URL
ENV MFE_TRANSACTIONS_URL=$MFE_TRANSACTIONS_URL
ENV MFE_AUTH_URL=$MFE_AUTH_URL

COPY . .
RUN yarn workspace "$APP_NAME" build
RUN mkdir -p \
    apps/mfe-auth/public \
    apps/mfe-home/public \
    apps/mfe-transactions/public \
    apps/shell/public

FROM node:22-alpine AS runner

ARG APP_NAME
ENV APP_NAME=$APP_NAME
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app
COPY --from=builder /app/apps/${APP_NAME}/.next/standalone ./
COPY --from=builder /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
COPY --from=builder /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public

EXPOSE 3000
RUN chown -R node:node /app
USER node
CMD ["sh", "-c", "node apps/$APP_NAME/server.js"]
