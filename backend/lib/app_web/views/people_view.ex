defmodule AppWeb.PeopleView do
  use AppWeb, :view

  def render("index.json", %{"data" => people, "metadata" => metadata}) do
    %{
      data: render_many(people, __MODULE__, "person.json"),
      metadata: metadata
    }
  end

  def render("person.json", %{people: person}) do
    Map.take(person, ["id", "email_address", "first_name", "last_name", "title"])
  end
end
