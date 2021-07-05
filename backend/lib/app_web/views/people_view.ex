defmodule AppWeb.PeopleView do
  use AppWeb, :view

  def render("index.json", %{"data" => people, "metadata" => metadata}) do
    %{
      data: render_many(people, __MODULE__, "person.json"),
      metadata: metadata
    }
  end

  def render("duplicates.json", %{duplicates: dups}) do
    render_many(dups, __MODULE__, "duplicate.json")
  end

  def render("duplicate.json", %{people: %{possible_duplicate: a, duplicated_by: b}}) do
    %{
      possible_duplicate: person_fields(a),
      duplicated_by: person_fields(b)
    }
  end

  def render("person.json", %{people: person}), do: person_fields(person)

  defp person_fields(person),
    do: Map.take(person, ["id", "email_address", "first_name", "last_name", "title"])
end
