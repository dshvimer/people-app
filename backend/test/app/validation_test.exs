defmodule App.ValidationTest do
  use ExUnit.Case
  alias App.Validation

  describe "character_frequency/1" do
    test "returns characters with freq on success" do
      # given
      entries = ["ab", "ac"]

      # when
      result = Validation.character_frequency(entries)

      # then
      assert [%{character: :a, count: 2}, %{character: :c, count: 1}, %{character: :b, count: 1}] =
               result

      assert {:ok, _} = Jason.encode(result)
    end
  end
end
