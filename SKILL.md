---
name: uib-a
description: Capture an existing UI and propose changes around its users, content, and tasks. Produce mobile and desktop before/after mockups in one offline HTML with element selection, deletion, restoration, and saved reviews. Use for redesign proposals and follow-up review.
---

# uib-a — UI Before / After

Capture the current UI, identify a specific usability problem, and make an After that addresses it. Deliver one standalone HTML with genuine Before captures and an editable review of the After. Invocation: `$uib-a`.

## Scope first

- Read the target project's instructions and design/route contracts. Work in its designated artifact area. Do not import this skill's development project's conventions.
- If the user requests a specification, produce the specification and stop before implementation. Otherwise carry the authorized mockup task through capture, design, build, and verification.
- Infer brand, representative screens, roles, and supported viewports from the project. Ask only for information that materially changes the result and cannot be discovered. Record assumptions and exclusions.
- Default to preserving functional content, primary layout, and workflow order. Use `recompose-layout` when the user requests rearrangement. Preserve required consent, prices, legal copy, status rules, and confirmation flows.
- Product implementation, deployment, and public publishing require their own task authorization. Review deletions express design intent, not authorization to delete production features.

## Research and design

Read [product-design.md](references/product-design.md) before designing an After, including when revising an existing mockup. It defines the brief, composition choices, copy rules, and visual review. Follow the target product's identity; the bundled examples are tool demonstrations, not visual templates.

Read [workflow.md](references/workflow.md) for research and follow-up work. Inspect actual reference images, not just search snippets. Record public reaction counts, timestamp, creator, source link, and what fits the product. Treat popularity as evidence within the observed candidate set, never a global ranking or conversion claim. When counts/access are unavailable, mark that limitation and use available references.

Write a short brief in the artifact notes: who is using this screen, their next action, the content they need, the existing friction, and the brand details to retain. For each proposed change, name the content or action it serves. "Premium", "modern", "clean", and "not AI-looking" are not sufficient design decisions.

Compare references by task and information density before reaction counts. Use Dribbble for composition ideas and inspect a real product screen or documented interaction when accessible. Record which parts of a reference you reject as well as adopt. Do not let a presentation board, stock dashboard, or marketing hero determine an operational screen.

Use containers, type, imagery, spacing, and accent color for a specific purpose. Do not default every screen to an eyebrow heading, hero, three KPI cards, rounded tiles, and a promotional side panel. Use the product's own language. Do not add slogans, decorative English, random glyphs, invented metrics, generic encouragement, or fake urgency to fill space. Existing expressive branding remains valid when it serves the product.

## Produce the artifact

1. Read [authoring.md](references/authoring.md). Discover Node/browser availability. Use this package's dependencies (`npm ci` in the skill directory), not dependencies in the target project's source tree. Install the required Playwright browser only if missing, with `PLAYWRIGHT_SKIP_BROWSER_GC=1` to preserve other projects' browser caches.
2. Prepare `brand-profile.json`, `research.json`, screen/state/viewport coverage, and a project-local capture adapter if needed. Capture actual Before images and maps together with `scripts/capture.mjs`. Screenshots without DOM maps use explicit image/manual-region mode.
3. Author After HTML/CSS with stable `data-review-key` values on every meaningful selectable element. Use project assets via local relative paths. Each entry represents a named screen/state/viewport/variant. Read [review-contract.md](references/review-contract.md) for identity and deletion rules.
4. Build once with `node <skill>/scripts/build.mjs <manifest.json> <output-directory>`. The builder sanitizes executable content, embeds local assets, validates keys, generates the index, and then creates the HTML. It will not overwrite an existing output HTML.
5. Run `node <skill>/scripts/verify.mjs <output>/before-after.html`. Inspect screenshots at the actual viewport as well as in the reviewer. Apply the visual review in product-design.md: task visibility, useful content, supported copy, appropriate density, and justified decoration. A passing functional report does not establish design quality. Revise the composition if it still reads as a generic template; do not stop at a palette change. Do not claim untested browsers, devices, or design outcomes.
6. Report a clickable absolute HTML path, covered screens/states/viewports, checks performed, and material limitations. Copy to another directory only when requested or an existing preference applies.

The command-line tools resolve input paths relative to their configuration files. Never hardcode a user home, framework, brand, browser port, or dependency path.

## Continue a review

Use `node <skill>/scripts/extract.mjs <review.html> <new-directory>` to recover a validated bundle, element index, and saved deletion state as data without executing it. Match the supplied ID and side revision before editing. Preserve untouched entries and their Before baselines. Increment only the changed side revision; a changed meaning must not reuse an old ID. Rebuild with a previous bundle and review state as described in authoring.md; unresolved IDs are reported rather than silently applied elsewhere.

The reviewer defaults to selection mode. Local experience mode supports declarative transitions between named entries and local details controls; it never executes imported application scripts. Original files remain recoverable. Saved review HTML retains deletions and restoration controls, including after refresh.

## Package references

- [Product design](references/product-design.md): task brief, reference selection, layout and copy decisions, visual review.
- [Authoring and commands](references/authoring.md): input format, capture adapters, assets, stable keys, continuation.
- [Workflow](references/workflow.md): research evidence, brand extraction, fidelity, coverage.
- [Review contract](references/review-contract.md): UI behavior, selections, saved states.
- [Acceptance and limitations](references/acceptance.md): actual verification scope and release checks.
- `examples/`: fictional mobile and desktop fixtures used by `npm run demo`. Their data and style are not defaults for other projects. [Demo design notes](docs/design-notes.md) record the sample decisions and reference limitations.
