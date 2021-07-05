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

  describe "similar?/2" do
    test "true if identical" do
      assert Validation.similar?("abc", "abc")
    end

    test "true if one letter difference" do
      assert Validation.similar?("benoliv@salesloft.com", "benolive@salesloft.com")
    end

    test "false if one letter difference for short word" do
      refute Validation.similar?("ab", "abc")
    end

    test "false if totally different" do
      refute Validation.similar?("david@example.com", "bernie@example.com")
    end
  end

  describe "possible_duplicates/1" do
    test "returns value if they seem similar" do
      a = %{"id" => "1", "email_address" => "abc@example.com"}
      b = %{"id" => "2", "email_address" => "abcd@example.com"}

      assert [
               %{possible_duplicate: a, duplicated_by: b},
               %{possible_duplicate: b, duplicated_by: a}
             ] = Validation.possible_duplicates([a, b])
    end

    test "does not return if id is the same" do
      a = %{"id" => "1", "email_address" => "abc@example.com"}
      b = %{"id" => "1", "email_address" => "abcd@example.com"}

      assert [] = Validation.possible_duplicates([a, b])
    end

    test "does not return if domain is different" do
      a = %{"id" => "1", "email_address" => "abc@example.com"}
      b = %{"id" => "2", "email_address" => "abcd@google.com"}

      assert [] = Validation.possible_duplicates([a, b])
    end

    test "does not return if user is different" do
      a = %{"id" => "1", "email_address" => "bob@example.com"}
      b = %{"id" => "2", "email_address" => "joe@example.com"}

      assert [] = Validation.possible_duplicates([a, b])
    end
  end
end
