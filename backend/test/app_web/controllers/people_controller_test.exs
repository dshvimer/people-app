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

  describe "characters" do
    test "returns char count" do
      # given
      {:ok, _pid} = Salesloft.start()
      Salesloft.set_next_response({200, fake_data()})

      # when
      {:ok, res} = HTTPoison.get("http://localhost:4002/api/people/chars")

      # then
      assert res.status_code == 200
      assert {:ok, body} = Jason.decode(res.body)

      assert body == [
               %{"character" => "m", "count" => 4},
               %{"character" => "e", "count" => 4},
               %{"character" => "a", "count" => 3},
               %{"character" => "x", "count" => 2},
               %{"character" => "p", "count" => 2},
               %{"character" => "o", "count" => 2},
               %{"character" => "l", "count" => 2},
               %{"character" => "c", "count" => 2},
               %{"character" => "@", "count" => 2},
               %{"character" => ".", "count" => 2},
               %{"character" => "b", "count" => 1}
             ]
    end
  end

  describe "duplicates" do
    test "returns possible duplicates" do
      # given
      {:ok, _pid} = Salesloft.start()
      Salesloft.set_next_response({200, duplicate_data()})

      # when
      {:ok, res} = HTTPoison.get("http://localhost:4002/api/people/duplicates")

      # then
      assert res.status_code == 200
      assert {:ok, body} = Jason.decode(res.body)

      assert body == [
               %{
                 "duplicated_by" => %{
                   "email_address" => "abcd@example.com",
                   "first_name" => "Hellen",
                   "id" => 101_694_377,
                   "last_name" => "McKenzie",
                   "title" => "Product Optimization Executive"
                 },
                 "possible_duplicate" => %{
                   "email_address" => "abc@example.com",
                   "first_name" => "Kennedi",
                   "id" => 101_694_378,
                   "last_name" => "Kerluke",
                   "title" => "Legacy Communications Officer"
                 }
               },
               %{
                 "duplicated_by" => %{
                   "email_address" => "abc@example.com",
                   "first_name" => "Kennedi",
                   "id" => 101_694_378,
                   "last_name" => "Kerluke",
                   "title" => "Legacy Communications Officer"
                 },
                 "possible_duplicate" => %{
                   "email_address" => "abcd@example.com",
                   "first_name" => "Hellen",
                   "id" => 101_694_377,
                   "last_name" => "McKenzie",
                   "title" => "Product Optimization Executive"
                 }
               }
             ]
    end
  end

  defp fake_data do
    %{
      data: [
        %{
          email_address: "a@example.com",
          first_name: "Kennedi",
          id: 101_694_378,
          last_name: "Kerluke",
          title: "Legacy Communications Officer",
          any_other: "any"
        },
        %{
          email_address: "b@example.com",
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
          next_page: nil,
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

  defp duplicate_data do
    %{
      data: [
        %{
          email_address: "abc@example.com",
          first_name: "Kennedi",
          id: 101_694_378,
          last_name: "Kerluke",
          title: "Legacy Communications Officer",
          any_other: "any"
        },
        %{
          email_address: "abcd@example.com",
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
          next_page: nil,
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
