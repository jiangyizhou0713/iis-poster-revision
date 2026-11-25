# Poster revision prototype

Prose word count: 428 (whitespace count, excluding this line and setup commands).

## Status

A working local browser prototype explores preserving accepted decisions during one campus-poster revision. Five components are selectable. Only the registration panel supports two predefined style changes. The title and illustration have fixed visible lock states; the user cannot toggle them.

Suggestion generation is simulated with deterministic keyword rules. The interface implements a separate preview, a predefined interpretation correction, approval, discard and undo. It does not call an AI model. General editing, user-controlled property locks, exact before/after explanation and participant evaluation remain unfinished or planned.

## Run or inspect

Open `app/index.html` directly in a modern browser, or serve the files:

```bash
python3 -m http.server 8001 --directory app
```

Visit `http://localhost:8001/`. Python is optional for serving; no account, API key, npm installation or other dependency is required. The app uses plain HTML, CSS, JavaScript and browser `structuredClone`. State resets when the page reloads.

## Replay the interactions

1. Keep Registration panel selected. Request "Make the registration panel stand out" and choose Suggest a local change. Inspect the separate readability preview; the current poster remains unchanged.
2. Choose Correct to request a playful accent. Apply to registration, then Undo to restore the previous style and intent. Revision numbers continue increasing.
3. Enter "Make it different" to see a clarification question. No candidate is applied.

## Development and verification

See [the development record](docs/development.md), [architecture](docs/architecture.png), [illustrated replays](docs/storyboards.png) and [recorded checks](docs/checks.json). The repository imports an existing October prototype; it does not recreate historical commits. Eleven state checks can be rerun with Node.js:

```bash
node tests/check_interaction.cjs
```

The tests use a minimal DOM stub. They do not measure usability or replace browser checks. There has been no participant study.

## AI assistance and authorship

Codex assisted with the scenario, source reading, implementation, debugging, tests, figures, README and report drafting. The student selected the poster direction, requested revisions and selected G9/G11 guidelines during the later review. Codex checked implementation claims against the source, replayed controls in a browser and ran state checks. Text and pending research decisions still require student review. Earlier AI-generated material was revised to distinguish inference from explicit correction and to preserve intent consistently on discard and undo.

The W7 capture contained AI-operated and student-operated segments; it is not used as evidence of attention or effectiveness. Private activity traces, student identifiers, credentials and course PDFs are excluded from this repository.

## Additional material

The A2 report is supplied separately through Canvas. No supplementary ZIP is needed to run the prototype. Figures are code-drawn schematics of the implemented states, not participant screenshots. Academic references are listed in [references.md](docs/references.md). Poster text is example copy; its decorative illustration is made with CSS.
