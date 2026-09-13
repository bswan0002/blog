---
title: "The Browser Was Doing Exactly What We Asked: Debugging stale search"
description: "Example post: JavaScript and JSX highlighting, task lists, blockquotes, reference links, and wide comparison tables."
pubDate: 2026-01-08
---

The bug report said “search sometimes goes backwards.” A user typed a service name, saw the right results, and then watched an older response replace them. The browser was not confused. Our code had confused *the last response to finish* with **the latest request we intended to show**.

This fictional debugging write-up is a typography fixture. Any timings below are illustrative, not benchmark results.

## Reproduce the ordering

> “It only happens on slow Wi-Fi.”
>
> That is a reproduction hint, not evidence that the network is broken.
>
> > The important question is which response is still allowed to update the screen.

We can reproduce the problem without a real server. This JavaScript block includes regexes, template literals, optional chaining, async functions, and a deliberately long data record.

```js
const fixtures = [
  { id: "svc-01", name: "billing-worker", description: "Processes invoice reconciliation events for organizations with multiple billing accounts, regional pricing agreements, and unusually long internal service ownership descriptions." },
  { id: "svc-02", name: "build-coordinator", description: "Schedules preview builds" },
  { id: "svc-03", name: "browser-gateway", description: "Routes browser traffic" },
]

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

async function fakeSearch(query) {
  // Shorter queries deliberately finish later.
  await wait(query.length < 3 ? 800 : 100)
  const normalized = query.trim().replace(/\s+/g, " ").toLowerCase()
  return fixtures.filter((service) => service.name.includes(normalized))
}

function createLatestSearch(onResults, onError) {
  let generation = 0

  return async function search(query) {
    const currentGeneration = ++generation
    const parameters = new URLSearchParams({ query, include: "owner,repository,environment,lastDeployment,healthCheckSummary", sort: "relevance", direction: "descending" })
    console.debug(`Searching /api/services?${parameters.toString()}`)

    try {
      const results = await fakeSearch(query)
      if (currentGeneration !== generation) return
      onResults(results)
    } catch (error) {
      if (currentGeneration !== generation) return
      onError(error?.message ?? "Search failed without an error message")
    }
  }
}

const search = createLatestSearch(console.table, console.error)
void search("b")
void search("bill")
```

### Compare the policies

| Strategy                              | Prevents stale updates? | Stops unnecessary network work? | Important limitation to document for the next person investigating a production incident |
| :------------------------------------ | :---------------------: | :-----------------------------: | :--------------------------------------------------------------------------------------- |
| Generation counter                    |           Yes           |               No                | Old work continues, but its result is ignored when a newer search has started.           |
| `AbortController` plus cleanup guard  |           Yes           |             Usually             | Cancellation is cooperative; an aborted client request does not undo server-side work.   |
| Debouncing alone                      |           No            |        Reduces requests         | Two requests can still overlap when the user pauses between keystrokes.                  |
| ~~Hope the requests finish in order~~ |           No            |               No                | A fast local development server can hide the problem until release day.                  |

## Give the UI the same ownership rule

This JSX example assumes a same-origin `/api/services` endpoint returning an array of `{ id, name, description }` records. It is a rendering sample, not an endpoint added to this blog.

```jsx
import { useEffect, useId, useState } from "react"

export function ServiceSearch() {
  const inputId = useId()
  const [query, setQuery] = useState("")
  const [state, setState] = useState({ status: "idle", results: [] })

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    if (!query.trim()) {
      setState({ status: "idle", results: [] })
      return () => {
        active = false
        controller.abort()
      }
    }

    setState({ status: "loading", results: [] })

    async function load() {
      try {
        const response = await fetch(`/api/services?${new URLSearchParams({ query, include: "owner,repository,environment,lastDeployment,healthCheckSummary" })}`, { signal: controller.signal })
        if (!response.ok) throw new Error(`Search failed: ${response.status}`)
        const results = await response.json()
        if (active) setState({ status: "success", results })
      } catch (error) {
        if (active) setState({ status: "error", results: [], message: error instanceof Error ? error.message : "Search failed" })
      }
    }

    void load()
    return () => {
      active = false
      controller.abort()
    }
  }, [query])

  return (
    <section aria-label="Search services by name, repository, or the team responsible for maintaining their production deployment configuration">
      <label htmlFor={inputId}>Find a service</label>
      <input id={inputId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try billing-worker" />
      <p role="status">{state.status === "loading" ? "Searching…" : `${state.results.length} results`}</p>
      {state.status === "error" && <p role="alert">{state.message}</p>}
      <ul>
        {state.results.map((service) => (
          <li key={service.id}>
            <strong>{service.name}</strong>
            <p>{service.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

## Things to verify before calling it fixed

- [x] Start a slow request, then a fast request.
- [x] Clear the input while a request is running.
- [ ] Navigate away before the response arrives.
- [ ] Test keyboard navigation and screen-reader announcements.
- [ ] Try a query with punctuation: `billing / preview + canary?`.

A useful reference is [MDN’s guide to AbortController][abort]. A long visible URL is a separate wrapping test: <https://example.com/engineering/incidents/search-results-arriving-out-of-order?environment=preview&include=deployment-history-and-service-ownership&request=deliberately-long-example>.

### The smallest useful takeaway

**Debouncing controls how often work starts. Cancellation controls whether work continues. Ownership controls which result may update the UI.** Those are three different responsibilities.

[abort]: https://developer.mozilla.org/en-US/docs/Web/API/AbortController "AbortController on MDN"
