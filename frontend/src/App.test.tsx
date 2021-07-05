import React from 'react';
import { render, screen, waitFor, getByText, fireEvent } from '@testing-library/react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import MatchMediaMock from 'jest-matchmedia-mock'
import App from './App';

let matchMedia: MatchMediaMock
describe('App', () => {

  beforeAll(() => {
    matchMedia = new MatchMediaMock()
    server.listen()
  })

  afterEach(() => {
    matchMedia.clear()
    server.resetHandlers()
  })

  afterAll(() => server.close())

  test('renders people on load', async () => {
    render( <App/> )
    await waitFor(() => screen.getByText(/a@example.com/i))
    await waitFor(() => screen.getByText(/b@example.com/i))
    const firstPerson = screen.getByText(/a@example.com/i)
    const secondPerson = screen.getByText(/b@example.com/i)
    expect(firstPerson).toBeInTheDocument()
    expect(secondPerson).toBeInTheDocument()
  })

  test('renders more people on load more', async () => {
    render( <App/> )
    await waitFor(() => screen.getByText(/a@example.com/i))
    await waitFor(() => screen.getByText(/b@example.com/i))
    const firstPerson = screen.getByText(/a@example.com/i)
    const secondPerson = screen.getByText(/b@example.com/i)
    expect(firstPerson).toBeInTheDocument()
    expect(secondPerson).toBeInTheDocument()

    const button = await screen.findByText('Load more')
    fireEvent.click(button)

    await waitFor(() => screen.getByText(/c@example.com/i))
    await waitFor(() => screen.getByText(/d@example.com/i))
    const thirdPerson = screen.getByText(/c@example.com/i)
    const fourthPerson = screen.getByText(/d@example.com/i)
    expect(thirdPerson).toBeInTheDocument()
    expect(fourthPerson).toBeInTheDocument()
  })

  test('Does not allow Load more on last page', async () => {
    server.use(
      rest.get('http://localhost:4000/api/people', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(lastPage)
          )
      })
    )
    render( <App/> )
    await waitFor(() => screen.getByText(/c@example.com/i))
    await waitFor(() => screen.getByText(/d@example.com/i))
    expect(screen.queryByText("Load more")).not.toBeInTheDocument()
  })

  test('Shows error if API error', async () => {
    server.use(
      rest.get('http://localhost:4000/api/people', (req, res, ctx) => {
        return res(
            ctx.status(404),
          )
      })
    )
    render( <App/> )
    await waitFor(() => screen.getByText(/Error/i))
    expect(screen.queryByText("There was an error")).toBeInTheDocument()
  })

  test('shows character count', async () => {
    render( <App/> )
    const button = await screen.findByText('Histogram')
    fireEvent.click(button)

    await waitFor(() => screen.getByText(/a: 2/i))
    const firstChar = await screen.findByText("a: 2")
    const secondChar = await screen.findByText("b: 1")
    expect(firstChar).toBeInTheDocument()
    expect(secondChar).toBeInTheDocument()
  })

  test('shows error when character count fails', async () => {
    server.use(
      rest.get('http://localhost:4000/api/people/chars', (req, res, ctx) => {
        return res(
            ctx.status(404),
          )
      })
    )

    render( <App/> )
    const button = await screen.findByText('Histogram')
    fireEvent.click(button)

    await waitFor(() => screen.getByText(/There was an error.../i))
    const e = await screen.findByText("There was an error...")
    expect(e).toBeInTheDocument()
  })

  test('shows duplicates', async () => {
    render( <App/> )
    const button = await screen.findByText('Duplicates')
    fireEvent.click(button)

    await waitFor(() => screen.getByText(/dup1@example.com/i))
    const first = await screen.findByText("dup1@example.com")
    const second = await screen.findByText("dup2@example.com")
    expect(first).toBeInTheDocument()
    expect(second).toBeInTheDocument()
  })

  test('shows error when duplicates fails', async () => {
    server.use(
      rest.get('http://localhost:4000/api/people/duplicates', (req, res, ctx) => {
        return res(
            ctx.status(404),
          )
      })
    )

    render( <App/> )
    const button = await screen.findByText('Duplicates')
    fireEvent.click(button)

    await waitFor(() => screen.getByText(/There was an error.../i))
    const e = await screen.findByText("There was an error...")
    expect(e).toBeInTheDocument()
  })


})

const server = setupServer(
  rest.get('http://localhost:4000/api/people', (req, res, ctx) => {
    if (req.url.searchParams.get('page') === "1") {
      return res(
        ctx.status(200),
        ctx.json(firstPage)
      )
    } else {
      return res(
        ctx.status(200),
        ctx.json(lastPage)
      )
    }
  }),
  rest.get('http://localhost:4000/api/people/chars', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([{character: "a", count: 2}, {character: "b", count: 1}])
    )
  }),
  rest.get('http://localhost:4000/api/people/duplicates', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(duplicates)
    )
  })

)

const duplicates = [
  {
    possible_duplicate: {
      "email_address": "dup1@example.com",
      "first_name": "Steven",
      "id": 1,
      "last_name": "Pease",
      "title": "Software Engineer"
    },
    duplicated_by: {
      "email_address": "dup2@example.com",
      "first_name": "Steven",
      "id": 1,
      "last_name": "Pease",
      "title": "Software Engineer"
    }
  }
]

const firstPage = {
  "data": [
    {
      "email_address": "a@example.com",
      "first_name": "Steven",
      "id": 1,
      "last_name": "Pease",
      "title": "Software Engineer"
    },
    {
      "email_address": "b@example.com",
      "first_name": "Possibly",
      "id": 2,
      "last_name": "Duplicate",
      "title": "My Job"
    }
  ],
  "metadata": {
    "filtering": {},
    "paging": {
      "current_page": 1,
      "next_page": 2,
      "per_page": 2,
      "prev_page": null
    },
    "sorting": {
      "sort_by": "updated_at",
      "sort_direction": "DESC NULLS LAST"
    }
  }
}

const lastPage = {
  "data": [
    {
      "email_address": "c@example.com",
      "first_name": "Steven",
      "id": 3,
      "last_name": "Pease",
      "title": "Software Engineer"
    },
    {
      "email_address": "d@example.com",
      "first_name": "Possibly",
      "id": 4,
      "last_name": "Duplicate",
      "title": "My Job"
    }
  ],
  "metadata": {
    "filtering": {},
    "paging": {
      "current_page": 2,
      "next_page": null,
      "per_page": 2,
      "prev_page": null
    },
    "sorting": {
      "sort_by": "updated_at",
      "sort_direction": "DESC NULLS LAST"
    }
  }
}
