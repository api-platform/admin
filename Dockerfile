#syntax=docker/dockerfile:1.4


# Versions
FROM node:20-alpine AS node_upstream


# Base stage for dev and build
FROM node_upstream AS base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# hadolint ignore=DL3018
RUN apk add --no-cache libc6-compat

WORKDIR /srv/app

RUN corepack enable && \
	corepack prepare --activate yarn@*

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME localhost

# Development image
FROM base as dev

CMD ["sh", "-c", "yarn install; yarn storybook"]

FROM base as ci

COPY --link package.json yarn.lock ./
RUN set -eux; \
	yarn

# copy sources
COPY --link . ./
RUN yarn storybook:build

CMD ["yarn", "serve"]
