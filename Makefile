backend:
	cd backend && iex -S mix phx.server

frontend:
	cd frontend && source .env && yarn start

setup: setup-backend setup-frontend

setup-backend:
	cd backend && mix deps.get

setup-frontend:
	cd frontend && yarn

test: test-backend test-frontend

test-backend:
	cd backend && source .env && mix test

test-frontend:
	cd frontend && source .env && CI=true yarn test