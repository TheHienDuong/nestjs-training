.PHONY: verify lint test build format db\:up db\:down

verify:
	pnpm verify

lint:
	pnpm lint

test:
	pnpm test

build:
	pnpm build

format:
	pnpm format

db\:up:
	pnpm db:up

db\:down:
	pnpm db:down
