defmodule App.Salesloft do
  import FE.Result, only: [and_then: 2]

  def list_people(page \\ 1) do
    "#{url()}/v2/people.json?page=#{page}"
    |> HTTPoison.get(headers())
    |> and_then(&check_status/1)
    |> and_then(&Jason.decode(&1))
  end

  def get_all_emails() do
    case do_all_people(1, []) do
      {:ok, people} -> {:ok, Enum.map(people, & &1["email_address"])}
      error -> error
    end
  end

  def get_all_people() do
    do_all_people(1, [])
  end

  defp do_all_people(:error, error), do: {:error, error}
  defp do_all_people(nil, people), do: {:ok, people}

  defp do_all_people(page, people) do
    case list_people(page) do
      {:ok, data} ->
        new_people = data["data"]
        next_page = get_in(data, ["metadata", "paging", "next_page"])
        do_all_people(next_page, people ++ new_people)

      {:error, e} ->
        do_all_people(:error, e)
    end
  end

  defp check_status(%HTTPoison.Response{} = res) do
    case res do
      %{status_code: 200, body: body} ->
        {:ok, body}

      %{status_code: 401} ->
        {:error, :not_authenticated}

      _ ->
        {:error, :unknown}
    end
  end

  defp api_key, do: Application.get_env(:app, :salesloft)[:api_key]
  defp url, do: Application.get_env(:app, :salesloft)[:url]
  defp headers, do: [Authorization: "Bearer #{api_key()}"]
end
