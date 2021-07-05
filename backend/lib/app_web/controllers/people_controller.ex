defmodule AppWeb.PeopleController do
  use AppWeb, :controller
  alias App.{Salesloft, Validation}

  def index(conn, params) do
    page = params["page"] || 1

    case Salesloft.list_people(page) do
      {:ok, people} -> render(conn, "index.json", people)
      {:error, :not_authenticated} -> put_status(conn, 401)
      {:error, :unknown} -> put_status(conn, 500)
    end
  end

  def characters(conn, _) do
    case Salesloft.get_all_emails() do
      {:ok, emails} -> json(conn, Validation.character_frequency(emails))
      {:error, :not_authenticated} -> put_status(conn, 401)
      {:error, :unknown} -> put_status(conn, 500)
    end
  end

  def duplicates(conn, _) do
    case Salesloft.get_all_people() do
      {:ok, people} ->
        duplicated = Validation.possible_duplicates(people)
        render(conn, "duplicates.json", duplicates: duplicated)

      {:error, :not_authenticated} ->
        put_status(conn, 401)

      {:error, :unknown} ->
        put_status(conn, 500)
    end
  end
end
