# Approval Rules

Always ask for explicit user approval before:

- Creating, modifying, or deleting any file outside the task scope.
- Creating a file under the `specs/` folder — the agent must present the spec and get explicit user approval before writing it.
- Deleting any file or directory, including tests, reports, or scripts.
- Committing, pushing, force-pushing, or opening a pull request.
- Creating Jira issues or changing Jira issue statuses (dry-run first).
- Disabling, skipping, deleting, or significantly altering an existing test.
- Running destructive commands (`git reset --hard`, `git clean`, `rm -rf`, package uninstalls).
- Switching environments with real credentials or pointing tests at `prod`.

Actions that need no approval:

- Reading files, searching the codebase, running the suite locally, generating reports.
- Fixing lint/format/type errors, updating locators, adding step definitions for a requested feature.
- Running the healing workflow within its 3-attempt limit.
