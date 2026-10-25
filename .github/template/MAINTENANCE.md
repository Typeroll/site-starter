# Template maintenance

This repository is a generated distribution of the published Typeroll workspace,
not another implementation of the prompts. Change prompts and agent instructions
in `Typeroll/typeroll`, release MCP, then synchronize this template. Files under
`.github/template/` own only the GitHub introduction, synchronization and tests.

`sync.yml` runs daily and on manual dispatch, only in `Typeroll/site-starter`.
It requires npm's exact stable version and gitHead to match the verified MCP tag,
generates a fresh workspace with that pinned version, validates its hashes and
empty binding, then commits changes under the name `autopilot`. It refuses a
downgrade or replacement of an existing release identity. Missing tags, network
errors and unexpected output fail the job without publishing. Concurrent syncs
are serialized. No cross-repository token or customer credential is used.

```sh
node --test .github/template/sync.test.mjs
node .github/template/sync.mjs --version 0.45.77 --check
node .github/template/sync.mjs
```

The last command writes only in the original repository. Never use it in a
customer project; customers run `typeroll init . --update` instead. The original
repo must not contain customer edits. Removed generator files are not deleted
automatically: review a source removal before retiring obsolete template files.
The validator rejects new file families until their purpose is reviewed.

`README.md` prepends `intro.md` to the generator's README. Its original generator
hash is retained in `typeroll.lock.json`, deliberately marking it as edited for
the customer's updater. All other managed files match the release exactly.
Do not duplicate kickoff prompts in this introduction or the public docs.

Workflow guards disable both synchronization and template checks in copies.
Owners can remove `.github/` from their projects without affecting MCP or CLI use.
The template license covers the starter, not any content customers add to it.


The next MCP starter includes reviewed optional QA source files beneath
`scripts/typeroll/` (`.py` and `.cjs` only). These are generated from Core's
workspace-templates with the same hash checks as Markdown. They are never run
by synchronization. No shell installers, credentials, node_modules or arbitrary
nested paths are accepted. Merge this validator support before synchronizing
that MCP release; do not copy unreleased scripts into a released-version lock.
