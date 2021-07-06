## Running the project

### ENV

Create env for backend

```
touch backend/.env
echo export SALESLOFT_API_KEY=<REAL API KEY> >> backend/.env
```

Frontend doesn't contain anything secret, so the .env is included

### Dependencies

Run `make setup` to install all dependencies

### Tests

Run `make test` to run the tests

### Development

In one terminal run `make backend` to run the server

In another, run `make frontend` to run the react app
