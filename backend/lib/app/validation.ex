defmodule App.Validation do
  def character_frequency(entries) do
    entries
    |> Enum.join("")
    |> String.graphemes()
    |> Enum.reduce(%{}, fn ch, acc ->
      key = String.to_atom(ch)

      case acc[key] do
        nil -> Map.put(acc, key, 1)
        val -> Map.put(acc, key, val + 1)
      end
    end)
    |> Enum.map(fn {key, val} -> %{character: key, count: val} end)
    |> Enum.sort_by(fn %{count: count} -> count end, &Kernel.>/2)
  end

  def possible_duplicates(people) do
    people
    |> Enum.map(fn person_a ->
      Enum.map(people, fn person_b ->
        if person_a["id"] == person_b["id"] do
          nil
        else
          [a, domain_a] = String.split(person_a["email_address"], "@")
          [b, domain_b] = String.split(person_b["email_address"], "@")
          is_similar = similar?(a, b) and similar?(domain_a, domain_b)
          {person_a, person_b, is_similar}
        end
      end)
    end)
    |> List.flatten()
    |> Enum.reject(fn result ->
      case result do
        nil -> true
        {_, _, true} -> false
        {_, _, false} -> true
      end
    end)
    |> Enum.map(fn {a, b, true} ->
      %{possible_duplicate: a, duplicated_by: b}
    end)
  end

  def similar?(a, b), do: String.jaro_distance(a, b) >= 0.9
end
