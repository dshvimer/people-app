defmodule AppWeb.Router do
  use AppWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", AppWeb do
    pipe_through :api
    get "/people", PeopleController, :index
    get "/people/chars", PeopleController, :characters
    get "/people/duplicates", PeopleController, :duplicates
  end
end
