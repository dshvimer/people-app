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
  })
)

//Setup stuff
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
