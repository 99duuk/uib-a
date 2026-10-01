---
name: uib-a
description: Create brand-aligned mobile and desktop UI before/after mockups using researched Dribbble references, packaged in an offline HTML reviewer with element selection, copy, deletion, restoration, and saved review states. Use for UI redesign mockups and follow-up element review, not ordinary bug fixes or automatic production changes.
---

# uib-a — UI Before / After

Turn an existing product into a reviewable design proposal. The default deliverable is one standalone HTML with genuine Before captures, selectable After DOM, and a reusable review interface. The invocation name is `$uib-a`.

## Scope first

- Read the target project's instructions and design/route contracts. Work in its designated artifact area. Do not import this skill's development project's conventions.
- If the user requests a specification, produce the specification and stop before implementation. Otherwise carry the authorized mockup task through capture, design, build, and verification.
- Infer brand, representative screens, roles, and supported viewports from the project. Ask only for information that materially changes the result and cannot be discovered. Record assumptions and exclusions.
- Default to preserving functional content, primary layout, and workflow order. Use `recompose-layout` when the user requests rearrangement. Preserve required consent, prices, legal copy, status rules, and confirmation flows.
- Product implementation, deployment, and public publishing require their own task authorization. Review deletions express design intent, not authorization to delete production features.

## Research and design

Read [workflow.md](references/workflow.md) for research and follow-up work. Inspect actual reference images, not just search snippets. Record public reaction counts, timestamp, creator, source link, and what fits the product. Treat popularity as evidence within the observed candidate set, never a global ranking or conversion claim. When counts/access are unavailable, mark that limitation and use available references.

Extract hierarchy, layout, spacing rhythm, typography relationships, and action placement. Recompose with the project's own colors, typography, assets, density, and product facts. Mobile customer pages and desktop operational tools can have different densities. Do not copy another product's artwork or fabricate reviews, discounts, or metrics.

## Produce the artifact

1. Read [authoring.md](references/authoring.md). Discover Node/browser availability. Use this package's dependencies (`npm ci` in the skill directory), not dependencies in the target project's source tree. Install the required Playwright browser only if missing, with `PLAYWRIGHT_SKIP_BROWSER_GC=1` to preserve other projects' browser caches.
2. Prepare `brand-profile.json`, `research.json`, screen/state/viewport coverage, and a project-local capture adapter if needed. Capture actual Before images and maps together with `scripts/capture.mjs`. Screenshots without DOM maps use explicit image/manual-region mode.
3. Author After HTML/CSS with stable `data-review-key` values on every meaningful selectable element. Use project assets via local relative paths. Each entry represents a named screen/state/viewport/variant. Read [review-contract.md](references/review-contract.md) for identity and deletion rules.
4. Build once with `node <skill>/scripts/build.mjs <manifest.json> <output-directory>`. The builder sanitizes executable content, embeds local assets, validates keys, generates the index, and then creates the HTML. It will not overwrite an existing output HTML.
5. Run `node <skill>/scripts/verify.mjs <output>/before-after.html`. Inspect screenshots of requested states as well as the automated report. Resolve real defects; do not claim untested browsers, devices, or design outcomes.
6. Report a clickable absolute HTML path, covered screens/states/viewports, checks performed, and material limitations. Copy to another directory only when requested or an existing preference applies.

The command-line tools resolve input paths relative to their configuration files. Never hardcode a user home, framework, brand, browser port, or dependency path.

## Continue a review

Use `node <skill>/scripts/extract.mjs <review.html> <new-directory>` to recover a validated bundle, element index, and saved deletion state as data without executing it. Match the supplied ID and side revision before editing. Preserve untouched entries and their Before baselines. Increment only the changed side revision; a changed meaning must not reuse an old ID. Rebuild with a previous bundle and review state as described in authoring.md; unresolved IDs are reported rather than silently applied elsewhere.

The reviewer defaults to selection mode. Local experience mode supports declarative transitions between named entries and local details controls; it never executes imported application scripts. Original files remain recoverable. Saved review HTML retains deletions and restoration controls, including after refresh.

## Package references

- [Authoring and commands](references/authoring.md): input format, capture adapters, assets, stable keys, continuation.
- [Workflow](references/workflow.md): research evidence, brand extraction, fidelity, coverage.
- [Review contract](references/review-contract.md): UI behavior, selections, saved states.
- [Acceptance and limitations](references/acceptance.md): actual verification scope and release checks.
- `examples/`: fictional mobile and desktop pages used by `npm run demo`; examples are not Dribbble research results.
