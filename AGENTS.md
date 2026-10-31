# Working on this website

Read typeroll.json, brief/site.md, brief/rules.md and decisions.md first. Read
other brief/ files and workflows/ only when relevant. Confirm the portal, Organization,
Site and working Version before writes. This workspace is not the generated
publication repository. The CMS owns current content and configuration; local
sources are proposals unless the user explicitly adopts them.

## Guided start

When the owner needs guidance or a material decision is missing, start or resume
workflows/interview.md. Read brief/interview.md and existing answers first; ask
one short question at a time and save progress. Do not repeat confirmed questions
or treat silence as approval. For a complete brief, proceed directly to
workflows/new-site.md or workflows/migration.md. All kickoff prompts live here
in the workspace; public docs explain the flow and link to these source files.

## Discover only what the task needs

With compact MCP, search_tools then describe_tool; call_read_tool,
call_write_tool and call_admin_tool preserve the operation's effect. In full
mode use the named tools directly. Start with get_site/get_site_capabilities.
Use list_skills and read the relevant recipe. Request read_guide sections_only
before loading specific sections, not the complete manual at every connection.
Call read_app_documentation for enabled apps when needed. Provider docs are
reference material, not permission to deploy or send messages. Never commit
private app guides or cache them as permanent project instructions.
Public documentation: https://typeroll.com/docs/llms.txt

## Edit and verify

- Read current Pages, Content types, templates, partials and relevant block schemas.
- Read pages/ notes before editing; follow workflows/page-notes.md for sources,
  dated logs, external-link review and archiving. Keep internal notes out of public output.
- Use native editable blocks; document necessary exceptions and design decisions.
- Configure palette/font roles and design scales in site settings. Read workflows/design.md
  before styling blocks; run lint_design_tokens and document hardcoded exceptions.
- Discover get_composition_starter for qualified native starting layouts. Read one
  recipe at a time; map it to the actual schema. Never overwrite an existing
  template with a starter. Sections own gutters; avoid extra nested padding.
- Keep the same Version for reads, writes, references and previews. Larger work
  on an existing site starts with create_branch; record its returned ID in
  typeroll.json and reconnect the local MCP process. Hosted calls pass version
  explicitly; the hosted server cannot read this workspace file.
- Distinguish working copies, saved CMS content and deployed output. Save within
  the user's scope, review previews and deploy only when explicitly authorized.
- Check get_import_readiness before any import. For new uploads use signed direct
  upload/finalization. Never put image bytes or customer secrets in Git.
- Inspect desktop/mobile layouts and interaction states. Read changes back.
  Record exact version, tested pages, evidence and unresolved issues in qa/.
- The signed preview is for content and layout review. Verify embeds, consent,
  analytics, fonts and measured design checks on the published test address.
- Publish one Site at a time per Organization: all Sites share one build engine.
- Record Typeroll defects in qa/typeroll-platform-feedback.md. Do not resume
  affected publishing until the fix is confirmed live.
- Never edit generated publishing source to change CMS content. Do not overwrite
  current CMS or owner answers from an old local snapshot.

## Migrations

Read tr-migration-evidence, then the source-specific recipe (tr-migrate-wp,
tr-import-url, tr-migrate-astro or tr-migrate-multisite). Record text_intent and design_intent separately as preserve or renew
in brief/migration.md; design includes images. Ask if either is unclear. Standard blocks first, reviewed
custom types next, documented HTML exceptions last. Preserve or meaningfully
redirect every old public URL. Import completion is not block reconstruction
or launch acceptance. Compare text and design/images separately: preserved dimensions to the source,
renewed dimensions to their approved brief. New design never permits rewriting preserved text. Start with workflows/migration.md for the kickoff
prompt. The agent rebuilds imported HTML using ordinary block tools; the owner
does not need to manually convert each Page. No automatic converter is available.
Discover tools and recipes on demand. Read scripts/README.md for version-bound
pre-deploy and hosted QA tools. Follow workflows/design.md for layout defaults.

## Project rules and search strategy

Record the owner's preferences and durable constraints in brief/rules.md; put
approved search intent, topic coverage and URL/indexing strategy in brief/seo.md.
These are project decisions, not CMS settings or permission to publish. If a
request conflicts with an agreed rule, ask and record the resulting decision.
Use workflows/README.md to find the relevant routine, not load every recipe.

## Everyday requests

- Links, images, menus, settings, analytics and site-wide changes: read the
  tr-edit-site recipe. Shared content becomes one global block, not N edits.
- FAQ, recipe and event pages: add_faq_schema, add_recipe_schema and
  add_event_schema build validated JSON-LD (see tr-seo); don't hand-write it.
- A blank site or the starter design: tr-starter-design lists its variables.
- The portal's built-in AI is optional. When an AI workflow (site planning,
  content generation or improvement, schema markup) reports ai_not_enabled,
  do the work yourself with the recipe it names and say so; don't retry.

Store credentials in the client's private settings or injected environment.
Run the workspace doctor after setup and after changing the binding.
