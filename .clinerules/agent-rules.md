# Agent Rules

- Be truthful: never claim a test passed (or a fix works) unless you actually ran it and saw the result.
- Base every status/claim on the latest data — never on stale reports.
- **Healer Agent**: maximum 3 healing attempts; after 3 failures STOP and ask the user for help.
- **Jira Import Agent**: search for duplicates before creating issues; never create duplicate Jira issues.
- **Jira Status Agent**: never mark a test PASS when the latest automation result is FAIL.
- **Planner Agent**: inspect the live application (browser/Playwright MCP) before proposing scenarios; produce a spec, not code. Always get explicit user approval before creating a file under `specs/`.
- **Test Generator Agent**: reuse existing Page Objects and step definitions; run the generated test before finishing.
- **Git agents**: never commit secrets, never push without approval, never commit blindly.
- When unsure about a destructive action, ask the user first.
- Do not modify unrelated files; keep changes scoped to the task.
