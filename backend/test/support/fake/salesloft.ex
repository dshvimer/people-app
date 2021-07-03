defmodule Test.Support.Fake.Salesloft do
  use Plug.Router
  plug(Plug.Parsers, parsers: [:json], json_decoder: Jason)
  plug(:match)
  plug(:dispatch)

  defp default_handler do
    fn conn, status, data ->
      ["Bearer 123"] = get_req_header(conn, "authorization")
      send_resp(conn, status, Jason.encode!(data))
    end
  end

  def start(handler \\ default_handler()) do
    Plug.Cowboy.shutdown(__MODULE__)

    {:ok, _pid} =
      Plug.Cowboy.http(__MODULE__, [],
        ref: __MODULE__,
        port: 4003
      )

    Agent.start_link(fn -> {200, fake_data(), handler} end, name: __MODULE__)
  end

  def stop do
    Plug.Cowboy.shutdown(__MODULE__)
  end

  def requests_received() do
    Agent.get(__MODULE__, &Enum.reverse(&1))
  end

  def set_next_response({status, next_data}) do
    Agent.update(__MODULE__, fn {_, _, handler} -> {status, next_data, handler} end)
  end

  get "/v2/people.json" do
    {status, data, handler} = Agent.get(__MODULE__, fn next -> next end)
    handler.(conn, status, data)
  end

  defp fake_data do
    %{
      data: [
        %{
          email_address: "jadyn_nolan@marksmurazik.name",
          first_name: "Kennedi",
          id: 101_694_378,
          last_name: "Kerluke",
          title: "Legacy Communications Officer",
          any_other: "any"
        },
        %{
          email_address: "marcelina@herman.com",
          first_name: "Hellen",
          id: 101_694_377,
          last_name: "McKenzie",
          title: "Product Optimization Executive",
          any_other: "any"
        }
      ],
      metadata: %{
        filtering: %{},
        paging: %{
          current_page: 1,
          next_page: 2,
          per_page: 25,
          prev_page: nil
        },
        sorting: %{
          sort_by: "updated_at",
          sort_direction: "DESC NULLS LAST"
        }
      }
    }
  end
end
