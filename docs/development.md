# Development record

This record was assembled on 25 November 2026 from existing local project files and new verification. Earlier stages were not recorded as Git commits; the repository import does not recreate a historical commit sequence.

| Stage | Evidence and decision | Status |
| --- | --- | --- |
| October 2026 literature and scenario work | The project moved towards preserving accepted decisions during campus-poster revision. A1 reviewed intent representations, scoped edits and existing locking mechanisms. The scenario requests a more noticeable registration panel while retaining the title and illustration. | Design rationale; no user study |
| 13 October storyboard | Normal revision and a mismatch between readability and playful emphasis were described. A correction should change the proposed interpretation before the poster changes. | Design specification |
| 29 October browser prototype | A standalone HTML/CSS/JavaScript implementation added selection, two rule-produced registration styles, a separate preview, correction, approval, discard and undo. Other components are inspectable but not generally editable. | Implemented interface; simulated AI suggestion generation |
| 29 October state revision | Pending intent was separated from confirmed state. Discard no longer retains an unaccepted interpretation. Undo restores the previous component and intent state but increments the revision, preventing reuse of an old revision identity. User-facing text was changed to English. | Implemented |
| 24 to 25 November verification | Chrome walkthrough checked preview, correction, application and undo. Revision 1 remained unchanged during preview; application produced revision 2; undo restored the original state with revision 3. These are developer observations, not usability results. | Observed in browser |
| 25 November Lab 7 reflection | G9 matches the existing correction/recovery controls. G11 motivated a planned property-by-property before/after explanation and a visible account of the rule that produced a suggestion. The Lab 7 trace mixed AI demonstration, student continuation and AI-assisted note saving. It is not evidence of natural attention or poster effectiveness and is not distributed here. | Reflection; G11 improvement planned |
| 25 November A2 packaging | The existing app was copied without changing its behaviour. Eleven state regression checks cover preview isolation, correction, application scope, undo, discard, clarification and validator rejection paths. Test method and results are supplied. | Developer verification |

## Checks and limits

Run `node tests/check_interaction.cjs`. Recorded output is in [checks.json](checks.json). The harness uses a minimal DOM stub and tests the real app script's state transitions. It does not test CSS, accessibility, browser compatibility or user experience. The lock guard test sets an internal fixture; the UI does not expose user-controlled locks.

Three illustrated replays in [storyboards.png](storyboards.png) correspond to available controls and states. They are schematic redrawings, not participant observations or captured screenshots. [architecture.png](architecture.png) distinguishes working application components, simulated AI behaviour and planned extensions.

Known limitations include two predefined registration styles, keyword matching without general language understanding, fixed title/illustration lock states and memory that resets on reload. Requests with negation or several goals may be misinterpreted by the keyword rule. The preview and correction route is therefore essential; the prototype does not establish that users will notice every mismatch.

No external generative model, general image generation, property editor, controllable attribute locks, persistent storage or user evaluation is implemented. These remain possible extensions, not completed work.
