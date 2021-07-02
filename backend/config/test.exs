use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :app, AppWeb.Endpoint,
  http: [port: 4002],
  server: true

# Print only warnings and errors during test
config :logger, level: :warn

# Salesloft api
config :app, :salesloft,
  api_key: "123",
  url: "http://localhost:4003"
