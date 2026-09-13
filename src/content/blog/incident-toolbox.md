---
title: "A Small Incident-Response Toolbox"
pubDate: 2026-01-12
---

An incident tool should be boring enough to understand while tired. This example reads newline-delimited JSON, counts errors, and prints a compact report. It is deliberately longer than a typical hello-world snippet so we can inspect indentation, blank lines, comments, and overflow.

**All service names, paths, and log records in this post are fictional.** The shell commands operate on a temporary directory and do not contact production systems.

## Parse one record at a time

Streaming avoids loading the entire input file at once. It does not automatically bound every other data structure: a counter keyed by arbitrary service names can still grow with the number of unique names.[^memory]

```python
#!/usr/bin/env python3
"""Summarize error events from a UTF-8 newline-delimited JSON file."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Iterator


def read_events(path: Path) -> Iterator[dict[str, object]]:
    with path.open(encoding="utf-8") as source:
        for line_number, line in enumerate(source, start=1):
            if not line.strip():
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError as error:
                print(f"Skipping malformed event in {path.name} at line {line_number}: {error.msg}; preserve the original input if you need to investigate a partially written or truncated log record.")
                continue

            if isinstance(event, dict):
                yield event


def summarize(path: Path, limit: int) -> str:
    errors: Counter[str] = Counter()
    total = 0

    for event in read_events(path):
        total += 1
        if event.get("level") not in {"error", "critical"}:
            continue
        service = str(event.get("service", "unknown"))
        errors[service] += 1

    rows = [f"Read {total:,} events", "", f"{'SERVICE':<48} {'ERRORS':>8}"]
    rows.extend(f"{service:<48} {count:>8,}" for service, count in errors.most_common(limit))
    if not errors:
        rows.append("No error or critical events found.")
    return "\n".join(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Summarize error events without loading the entire incident log into memory; service counts still grow with the number of distinct service names.")
    parser.add_argument("path", type=Path)
    parser.add_argument("--limit", type=int, default=10)
    arguments = parser.parse_args()
    if arguments.limit < 1:
        parser.error("--limit must be positive")
    print(summarize(arguments.path, arguments.limit))


if __name__ == "__main__":
    main()
```

### Run it against a tiny fixture first

Save the Python example as `summarize.py`. The quoted heredoc below preserves `$`, backticks, and backslashes literally; the long JSON lines are intentional.

```bash
#!/usr/bin/env bash
set -euo pipefail

workspace="$(mktemp -d)"
trap 'rm -rf -- "$workspace"' EXIT

log_file="$workspace/incident-events.ndjson"

cat > "$log_file" <<'JSONL'
{"level":"info","service":"gateway","message":"Request accepted","requestId":"req-example-001"}
{"level":"error","service":"billing-reconciliation-worker","message":"Upstream request exceeded the configured deadline while resolving organization billing preferences for a scheduled reconciliation job in the preview environment","requestId":"req-example-002"}
{"level":"critical","service":"billing-reconciliation-worker","message":"Retry budget exhausted","requestId":"req-example-003"}
{"level":"error","service":"deployment-status-notification-dispatcher","message":"Notification could not be delivered","requestId":"req-example-004"}
JSONL

if ! command -v python3 >/dev/null 2>&1; then
  printf '%s\n' 'Python 3 is required to run this example.' >&2
  exit 1
fi

printf '\n%s\n' 'Summarizing the local fixture, not a production log:'
python3 ./summarize.py "$log_file" --limit 5

printf '\n%s\n' 'Checking that the fixture contains four records:'
record_count="$(wc -l < "$log_file" | tr -d '[:space:]')"
[[ "$record_count" == "4" ]] || {
  printf 'Expected 4 records; received %s\n' "$record_count" >&2
  exit 1
}

printf 'Finished successfully. Temporary fixture directory: %s\n' "$workspace"
```

Expected output uses a plain text fence, so it should preserve alignment without pretending to be a programming language:

```text
Read 4 events

SERVICE                                            ERRORS
billing-reconciliation-worker                           2
deployment-status-notification-dispatcher                1
```

## An investigation is more than a command

1. **Write down the question.**

   “Which service logged the most errors?” is answerable. “Why is everything broken?” is not yet a useful query.

2. **Inspect the shape of the input.**

   Start with a small, sanitized sample rather than pasting sensitive logs into a shared document.

   ```bash
   # Inspect a local file before choosing fields to aggregate.
   head -n 3 ./sanitized-events.ndjson
   ```

3. **Record the time window.**

   A count without a window is not a rate. An error rate without traffic volume can be misleading.

   - Use UTC when exchanging timestamps across teams.
   - Note whether the source clock may have drifted.
   - Keep the original query with the result.

4. **Document what the tool does not prove.**

   > An error message is evidence that a component observed a problem. It does not necessarily identify the component that caused it.

## A deliberately long log line

The following unhighlighted block tests a single unbroken identifier as well as ordinary words. Scrolling should remain local to the block rather than widening the entire article.

```
2026-01-12T03:14:15.926Z ERROR service=billing-reconciliation-worker request_id=req_abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789 message="The upstream dependency did not respond before the configured deadline; this record exists to stress-test horizontal overflow in a narrow reading column."
```

### Notes worth keeping

Use `--limit 5`, not the escaped literal \*asterisks\*, as the argument. To mention Markdown fence syntax in prose, use double backticks: `` `inline code` ``. These small punctuation cases help catch font and spacing regressions.

[^memory]: The file is streamed, but the service counter uses space proportional to the number of distinct service names. For untrusted, high-cardinality input, use a bounded aggregation strategy or a database.
