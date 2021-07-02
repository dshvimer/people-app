defmodule AppWeb.PeopleController do
  use AppWeb, :controller
  alias App.Salesloft
  import FE.Result, only: [and_then: 2, map_error: 2]

  def index(conn, params) do
    page = params["page"] || 1

    case Salesloft.list_people(page) do
      {:ok, people} -> render(conn, "index.json", people)
      {:error, :not_authenticated} -> put_status(conn, 401)
      {:error, :unknown} -> put_status(conn, 500)
    end
  end
end
