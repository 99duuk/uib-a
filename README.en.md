<div align="center">

# uib-a

### Current screens and proposed changes in one HTML

**Your current UI and proposed redesign, in one offline HTML file.**<br>
A Codex skill for mobile and desktop mockups with element selection, removal, restoration, and saved reviews.

[![License: MIT](https://img.shields.io/badge/License-MIT-3e6450.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-294b3e.svg)](package.json)

[한국어](README.md) · **English**

</div>

![Fieldwork project list, selected cover, and review request](docs/images/desktop-after.png)

<details>
<summary>Before/after reviewer and mobile example</summary>

![Desktop before/after review](docs/images/desktop-review.png)

<img src="docs/images/mobile-after.png" width="390" alt="Reading position and continue action in the revised mobile library">

</details>

## What is it?

**uib-a = UI Before / After**

- Capture the current screens and inspect their content
- Identify the user's next action and the information it requires
- Study relevant Dribbble references and real product interactions
- Propose changes using the product's existing data, terms, and identity

The deliverable is one self-contained HTML file. Open it in a browser, compare screens, select exact elements, try removing them, restore them, and save the review for another iteration. The default deliverable is a design proposal; production changes are a separate request.

## How the After is designed

- A task and content brief before layout work
- A reason for each group, container, image, and action placement
- No default hero, three KPI cards, rounded tile grid, and promotional sidebar
- Product language instead of decorative English headings, vague slogans, and invented metrics
- Brand-specific color and imagery where supported by the project
- Bundled examples as tool demonstrations, not starting templates for every product
- [Design criteria](references/product-design.md) · [Demo decisions and references](docs/design-notes.md)

The reading example puts the current page and continue action next to a small cover. Fieldwork opens a cover review beside the project list, with the request and a local note field alongside the document. Its cover is an authored placeholder. Both retain the original Before captures and project data.

## Why use it?

- **Decide before implementing.** Review the actual current screen beside the proposal.
- **Keep your brand.** Adapt layout, spacing, and hierarchy to your product's colors, content, and density.
- **Make feedback precise.** Copy the selected element's screen, ID, revision, and locator.
- **Explore subtraction.** Temporarily remove elements and restore them at any time.
- **Share easily.** Reviewers only need a browser; the generated HTML works offline.
- **Cover mobile and desktop.** Separate viewport entries preserve actual layout sizes.

## Quick start

Requires Codex, Node.js 22+, npm, and Git. Initial installation and reference research need internet access.

```sh
git clone https://github.com/99duuk/uib-a.git
cd uib-a
npm run install:skill
```

Installs to `$CODEX_HOME/skills/uib-a`, or `~/.codex/skills/uib-a` when unset. Existing installations are preserved. Open a new Codex conversation in your project:

```text
$uib-a Inspect the customer start screen and desktop admin home.
Identify what the user needs to do and what is hard to find.
Keep the existing data and brand, and propose a layout that addresses those problems.
Explain the placement decisions and put Before/After in one HTML.
Keep production code unchanged and give me the absolute file path.
```

If the capture browser is missing, the skill guides its installation. To run the fictional demo directly from the cloned repository:

```sh
npm ci
# macOS / Linux; preserve other projects' browser caches
PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
npm run demo
```

Open **`output/demo/before-after.html`**. In PowerShell, set `$env:PLAYWRIGHT_SKIP_BROWSER_GC='1'` before running `npx playwright install chromium`. See [Playwright's browser guide](https://playwright.dev/docs/browsers) for Linux dependencies.

Or [download the ready-made demo HTML](https://raw.githubusercontent.com/99duuk/uib-a/main/docs/demo/before-after.html), save it, and open it locally. It uses fictional reading and work dashboard examples, not customer screenshots or claimed Dribbble rankings.

The demo rebuild reuses its bundled Before captures and generates After from the example source. Your project requires its own screen captures.

## Review controls

| Control | What it does |
| --- | --- |
| Screen / state / viewport / variant | Switch between authored entries |
| Side by side / single view | Compare or focus on one version |
| Fit / 100% | Scale the preview or inspect actual CSS pixel size |
| Click / tap / keyboard / element list | Select an element and copy its identity |
| Ancestor selection | Select a containing card or section |
| Remove | Hide After DOM with reflow; mask Before screenshot regions |
| Restore / undo | Recover individual elements or all removals |
| Save reviewed HTML | Preserve deletion state while keeping originals restorable |
| Local experience mode | Follow declared transitions between mockup states |

Unsaved removals reset on refresh. A saved HTML reopens with its saved removals. It remains editable and restorable.

## Keep iterating

```text
$uib-a Add the remaining settings and billing screens using the same review format.
Preserve the existing entries and Before captures.
```

```text
$uib-a Use this saved HTML and the copied element details to revise the selected screen.
Keep untouched screens unchanged and increment the revised screen's version.
```

## Documentation

- [Skill instructions](SKILL.md)
- [After layout, copy, and visual review](references/product-design.md)
- [Authoring, capture adapters, and rebuilding](references/authoring.md)
- [Research and brand workflow](references/workflow.md)
- [Selection, identity, deletion, and persistence](references/review-contract.md)
- [Verification scope and limitations](references/acceptance.md)
- [Manifest schema](references/manifest.schema.json)

Detailed reference guides and the current review toolbar are in Korean. The skill can follow English project requests.

## Scope and limitations

Reference popularity is assessed only from publicly observable candidates. Missing counts and access limitations are recorded. The skill does not guarantee conversion improvements or copy third-party artwork into your product.

Initial verification covered 41 review checks plus 20 input/data checks on macOS Chromium. Mobile input was emulated. Other browsers, operating systems, and physical devices need their own checks. Before images without DOM maps support whole-image or explicitly authored manual regions.

## Contributing & license

[Open an issue](https://github.com/99duuk/uib-a/issues) with your browser, OS, reproduction steps, and expected behavior. Share only minimal, anonymized examples. Pull requests should explain the change and the behavior checked.

[MIT License](LICENSE) · Copyright © 2026 99duuk. Dependencies and third-party design assets retain their respective licenses. Community project; not an official OpenAI or Dribbble product.
