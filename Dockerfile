#syntax=docker/dockerfile:1.4


# Versions
FROM node:20-bookworm AS node_upstream


# Base stage for dev and build
FROM node_upstream AS base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# hadolint ignore=DL3018
# RUN apt-get install libc6-compat

WORKDIR /srv/app

RUN corepack enable && \
	corepack prepare --activate yarn@*

ENV HOSTNAME localhost
EXPOSE 3000
ENV PORT 3000

# Development image
FROM base as dev

CMD ["sh", "-c", "yarn install; yarn storybook"]

FROM base as ci

# EXPOSE 3001
# ENV PORT 3001

COPY --link package.json yarn.lock ./
RUN set -eux; \
	yarn

# copy sources
COPY --link . ./

RUN set -eux; \
	yarn playwright install --with-deps

# CMD ["sh", "-c", "yarn storybook:build; yarn storybook:serve -p 3000"]
CMD ["sh", "-c", "yarn storybook;"]
