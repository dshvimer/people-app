defmodule AppWeb.PeopleControllerTest do
  use ExUnit.Case

  alias Test.Support.Fake.{Salesloft}

  describe "index" do
    test "returns people" do
      # given
      {:ok, _pid} = Salesloft.start()

      # when
      {:ok, res} = HTTPoison.get("http://localhost:4002/api/people")

      # then
      assert res.status_code == 200
      assert {:ok, body} = Jason.decode(res.body)
      assert is_list(body["data"])
      assert is_map(body["metadata"])
    end
  end
end
