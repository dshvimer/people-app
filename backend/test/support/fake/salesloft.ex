defmodule Test.Support.Fake.Salesloft do
  use Plug.Router
  plug Plug.Parsers, parsers: [:json], json_decoder: Jason
  plug :match
  plug :dispatch

  def start do
    Plug.Cowboy.shutdown(__MODULE__)

    {:ok, _pid} =
      Plug.Cowboy.http(__MODULE__, [],
        ref: __MODULE__,
        port: 4003
      )

    Agent.start_link(fn -> [] end, name: __MODULE__)
  end

  def stop do
    Plug.Cowboy.shutdown(__MODULE__)
  end

  def requests_received() do
    Agent.get(__MODULE__, &Enum.reverse(&1))
  end

  get "/v2/people.json" do
    ["Bearer 123"] = get_req_header(conn, "authorization")
    Agent.update(__MODULE__, &[{:index, query: fetch_query_params(conn)} | &1])
    send_resp(conn, 200, Jason.encode!(fake_data()))
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
