## Running the project

### ENV

Create env for backend

```
touch backend/.env
echo export SALESLOFT_API_KEY=<REAL API KEY> >> backend/.env
```

Frontend doesn't contain anything secret, so the .env is included

### Dependencies

Run `make setup` to install all dependencies

### Tests

Run `make test` to run the tests

### Development

In one terminal run `make backend` to run the server

In another, run `make frontend` to run the react app

## Notes

### Backend

The architecture here is simple. With larger apps it's best to use "contexts". I try to build codebases the way the `timex` codebase is structured. Each context will have submodules like `Context.Submodule`. The root level module will marry the submodules and exposes the preferred interface. Small modules that we can compose are favored over larger modules. IO/Data access and business logic should be kept apart as much as possible. Service type modules will bring together data access, models, and business logic.

When I was maintaining an elixir app at Papa, we used Absinthe and gql. Unfortunately for me, Phoenix.View is pretty new and it makes a lot of assumptions. This was the biggest headache for me. I'm going to take a deeper dive into Views next time I'm digging into some elixir.

I added the `FE` package that some of my co-workers wrote. I really like the `and_then`, `map`, `map_error` functions here. I've seen some unruly `with` statements and `case` trees. The haskell style functions make railway style code so much more readable.

I didn't add any additional logging

### Frontend

To make review easier, I decided to put everything into one file. In a real application it's better to have each component/object in it's own folder. In the folder, the component, a test and a story file. Storybook is the best way to develop components. That guarantees isolation. I chose to use Chakra UI because I haven't had the chance to yet and was looking for an excuse. The design is minimal and they include some components for layout that mirror every layout's philosophy: https://every-layout.dev/

Note: I cannot make something pretty to save my life, so I put my heart into getting one to one with the high fidelity designs instead

### Tests

On the backend, I tend to favor a TDD workflow. Sometimes I use an `iex` workflow if I'm not sure where I want to end up. For the controller integration tests, I choose to use real http requests. This is a philosophy my current co-workers have gotten me into. It tests the real thing. If we don't have to worry about some kind of env based modules, or dependency injection, the code will just be cleaner. It also gives the opportunity to write a fake api with Plug, which is a great learning experience.

There are no e2e/large tests. For the sake of time, I skipped them, but they are the most important. Everything else is just convenience. They are also the hardest to write. In my experience the e2e tests always have the intermittent failures in CI.

### Scalability

The tricky bit in the app is prefermoring some statistics on a paginated data set. I implemented the brute force approach. It will NOT scale.

The next simplist approach would be to use a cache that expires after some time. Each page goes into the cache and is valid for X minutes. If we use a read-through cache the consumer doesn't need to care where the data came from. We would run into some consistency issues with that approach.

A large scale approach is to use something like elasticsearch. It has some nice aggregation functions for character distributions. It would also come in handy for checking duplicates with fuzzy search, but I can't see how to get around an N+1 issue there.

### Duplicates

This is also a tricky one. I chose to check the domain and user in an email separately, but this may have been overthinking it. It's the way a human would check so it felt inuitive. We would find an almost negligible performance gain if we checked the whole email at once instead. In the real app, I imagine there are some business rules around duplicates:

-   The email is similar and so is the name
-   The email domain is different (dshvimer@gmail, dshvimer@protonmail) but the first and last names are similar
-   etc.

The data structure to represent something like this is an adjacency matrix. For a large dataset, I would be nervous loading everything into memory. Would look at elasticsearch for next steps on a system that scales.
