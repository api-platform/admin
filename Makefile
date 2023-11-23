include .env

.PHONY        : help cp-env start-simple stop-simple

help: ## Outputs this help screen
	@grep -E '(^[a-zA-Z0-9\./_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

install: ## Install the dependencies
	yarn install

cp-env: ## Copy the .env file to .env.local
	cp .env .env.local

start-simple: ## Start the simple Api-Platform backend and the Storybook frontend
	cd backend/simple && make build && make up HTTP_PORT=${SIMPLE_HTTP_PORT} HTTP3_PORT=${SIMPLE_HTTPS_PORT} HTTPS_PORT=${SIMPLE_HTTPS_PORT} && cd .. && yarn run storybook

stop-simple: ## Stop and prune the simple Api-Platform backend
	cd backend/simple && make prune