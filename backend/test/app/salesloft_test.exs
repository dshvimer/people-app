defmodule App.SalesloftTest do
  use ExUnit.Case
  alias Test.Support.Fake
  alias App.Salesloft

  describe "list_people/1" do
    test "returns people on success" do
      # given
      {:ok, _pid} = Fake.Salesloft.start()
      Fake.Salesloft.set_next_response({200, fake_data()})

      # when
      result = Salesloft.list_people()

      # then
      assert {:ok, data} = result
      assert length(data["data"]) == 2
    end

    test "returns paging info" do
      # given
      {:ok, _pid} = Fake.Salesloft.start()
      Fake.Salesloft.set_next_response({200, last_page()})

      # when
      result = Salesloft.list_people()

      # then
      assert {:ok, data} = result
      assert is_nil(data["metadata"]["paging"]["next_page"])
    end

    test "returns error on failure" do
      # given
      {:ok, _pid} = Fake.Salesloft.start()
      Fake.Salesloft.set_next_response({401, %{}})

      # when
      result = Salesloft.list_people()

      # then
      assert {:error, :not_authenticated} = result
    end
  end

  describe "get_all_emails/0" do
    test "gets all emails successfully" do
      # given
      handler = fn conn, status, _ ->
        if conn.query_string == "page=1" do
          Plug.Conn.send_resp(conn, status, Jason.encode!(fake_data()))
        else
          Plug.Conn.send_resp(conn, status, Jason.encode!(last_page()))
        end
      end

      {:ok, _pid} = Fake.Salesloft.start(handler)

      # when
      result = Salesloft.get_all_emails()

      # then
      assert {:ok, ["a@example.com", "b@example.com", "c@example.com"]} = result
    end

    test "returns error on failure" do
      # given
      {:ok, _pid} = Fake.Salesloft.start()
      Fake.Salesloft.set_next_response({401, %{}})

      # when
      result = Salesloft.get_all_emails()

      # then
      assert {:error, :not_authenticated} = result
    end
  end

  describe "get_all_people/0" do
    test "gets all people successfully" do
      # given
      handler = fn conn, status, _ ->
        if conn.query_string == "page=1" do
          Plug.Conn.send_resp(conn, status, Jason.encode!(fake_data()))
        else
          Plug.Conn.send_resp(conn, status, Jason.encode!(last_page()))
        end
      end

      {:ok, _pid} = Fake.Salesloft.start(handler)

      # when
      result = Salesloft.get_all_people()

      # then
      assert {:ok, people} = result

      assert ["a@example.com", "b@example.com", "c@example.com"] ==
               Enum.map(people, & &1["email_address"])
    end

    test "returns error on failure" do
      # given
      {:ok, _pid} = Fake.Salesloft.start()
      Fake.Salesloft.set_next_response({401, %{}})

      # when
      result = Salesloft.get_all_emails()

      # then
      assert {:error, :not_authenticated} = result
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

  defp last_page do
    %{
      data: [
        %{
          email_address: "c@example.com",
          first_name: "Kennedi",
          id: 101_694_378,
          last_name: "Kerluke",
          title: "Legacy Communications Officer",
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
