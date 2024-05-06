#syntax=docker/dockerfile:1.4


# Versions
FROM node:20-bookworm AS node_upstream


# Base stage for dev and build
FROM node_upstream AS base

WORKDIR /srv/app

RUN corepack enable && \
	corepack prepare --activate yarn@*

ENV HOSTNAME localhost
EXPOSE 3000
ENV PORT 3000

COPY --link package.json yarn.lock .yarnrc.yml ./

RUN set -eux; \
	yarn && yarn cache clean

# copy sources
COPY --link . ./

RUN set -eux; \
	yarn playwright install --with-deps && yarn cache clean

# Development image
FROM base as dev

CMD ["sh", "-c", "yarn storybook"]

FROM base as ci

CMD ["sh", "-c", "yarn storybook:build && yarn storybook:serve -p 3000"]
