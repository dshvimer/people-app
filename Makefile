server:
	cd backend && iex -S mix phx.server

client:
	cd frontend && source .env && yarn start

test:
	cd backend && source .env && mix test