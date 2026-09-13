---
title: "Designing Type-Safe API Boundaries Without Turning Every Fetch Request Into a Framework Nobody Wants to Maintain"
description: "Example post: TypeScript and TSX highlighting, wide code blocks, nested lists, and long inline identifiers."
pubDate: 2026-01-05
---

This is an **example post for testing Markdown rendering**, not a production API client. The snippets deliberately mix short lines with lines long enough to require horizontal scrolling or wrapping.

A useful API boundary translates an unreliable network into a small set of predictable outcomes. That sounds simple until you need cancellation, validation, helpful error messages, and a UI that distinguishes an empty result from a failed request.

## Start with the result, not the request

The type `Result<ReadonlyArray<DeploymentSummary>, DeploymentRequestError>` should sit comfortably inside a paragraph. A much longer identifier, `organizationSettings.experimentalDeploymentObservability.maximumPermittedConcurrentBackgroundRefreshRequests`, tests what happens when inline code has no convenient spaces.

```ts
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

type DeploymentSummary = {
  id: string
  service: string
  environment: "preview" | "production"
  status: "queued" | "running" | "complete"
}

type DeploymentRequestError = {
  kind: "http" | "network" | "invalid-response"
  message: string
}

function isDeployment(value: unknown): value is DeploymentSummary {
  if (typeof value !== "object" || value === null) return false
  const item = value as Record<string, unknown>
  return typeof item.id === "string" && typeof item.service === "string" && (item.environment === "preview" || item.environment === "production") && (item.status === "queued" || item.status === "running" || item.status === "complete")
}

export async function getDeployments(organizationId: string, signal?: AbortSignal): Promise<Result<ReadonlyArray<DeploymentSummary>, DeploymentRequestError>> {
  const url = new URL(`/api/organizations/${encodeURIComponent(organizationId)}/deployments`, "https://api.example.com")
  url.searchParams.set("include", "service,environment,status,createdAt,completedAt,triggeredBy,commitSha,healthChecks")

  try {
    const response = await fetch(url, {
      signal,
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      return { ok: false, error: { kind: "http", message: `Deployment lookup failed with HTTP ${response.status} for organization ${organizationId}; inspect the request identifier before retrying this operation.` } }
    }

    const payload: unknown = await response.json()
    if (!Array.isArray(payload) || !payload.every(isDeployment)) {
      return { ok: false, error: { kind: "invalid-response", message: "Expected an array of deployment summaries" } }
    }

    return { ok: true, value: payload }
  } catch (error) {
    if (signal?.aborted) throw error
    return { ok: false, error: { kind: "network", message: error instanceof Error ? error.message : "An unknown network error occurred" } }
  }
}
```

Notice the difference between **a valid empty array** and **a response we cannot understand**. Collapsing both into `[]` makes the interface look reassuring precisely when it should be asking for attention.

### Render each state explicitly

This standalone TSX fixture uses a discriminated union rather than several booleans that could contradict each other.

```tsx
import { useId } from "react"

type Deployment = {
  id: string
  service: string
  status: "queued" | "running" | "complete"
}

type Props = {
  state:
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "ready"; deployments: Deployment[] }
  onRetry: () => void
}

export function DeploymentPanel({ state, onRetry }: Props) {
  const headingId = useId()

  if (state.kind === "loading") {
    return <p role="status">Loading the most recent deployments…</p>
  }

  if (state.kind === "error") {
    return (
      <section aria-labelledby={headingId}>
        <h2 id={headingId}>We couldn’t load your deployments</h2>
        <p role="alert">{state.message}</p>
        <button type="button" onClick={onRetry}>Try again</button>
      </section>
    )
  }

  return (
    <section aria-labelledby={headingId} data-observability-component="organization-deployment-history-with-explicit-loading-error-and-empty-states">
      <h2 id={headingId}>Recent deployments</h2>
      {state.deployments.length === 0 ? (
        <p>No deployments yet. Your first successful build will appear here.</p>
      ) : (
        <ul>
          {state.deployments.map((deployment) => (
            <li key={deployment.id} className="deployment-history-item deployment-history-item--with-service-name-and-human-readable-status">
              <a href={`/deployments/${encodeURIComponent(deployment.id)}`}>{deployment.service}</a>
              <span aria-label={`Deployment status: ${deployment.status}`}>{deployment.status}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
```

## A review checklist with nested content

- Validate external data.
  - Check the container before its members.
  - Check discriminators as well as primitive types.
    - A string is not necessarily an allowed status.
    - A number is not necessarily a useful timeout.
- Preserve useful failures.

  A second paragraph inside a list item should align with its text, not with the bullet. It should also have enough spacing to remain distinct from the next item.

  > A fallback is a product decision, not just a convenient way to satisfy the compiler.

- Keep the rendering contract small.
  1. Loading means the first result is not available.
  2. Empty means the request succeeded with no records.
  3. Error means we cannot claim either of those things.

### What should stay out of this helper?

Authentication refresh, pagination, and retries all deserve explicit policies. This example intentionally omits them. A helper that silently retries a mutation can be much more dangerous than a helper that merely contains a few duplicated lines.

---

**Layout checks:** long title in the index and article header; tall and wide code blocks; inline code wrapping; nested list indentation; spacing before and after a blockquote inside a list.
