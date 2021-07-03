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
end
