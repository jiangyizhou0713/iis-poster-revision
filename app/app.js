"use strict";

const initial = {
  version: 1,
  components: {
    title: { text: "Imagine what's next with AI", locked: true },
    intro: { text: "Join the AI Society. Learn, build and create together.", locked: false },
    illustration: { locked: true },
    meta: { text: "31 October · 18:00\nCampus Innovation Hub", locked: false },
    registration: { text: "Sign up and start creating", style: "base", locked: false }
  },
  intent: null
};

let poster = structuredClone(initial);
let selected = "registration";
let proposal = null;
let undoStack = [];
let activity = ["Example poster loaded. Title and illustration are locked."];
let feedback = "Select the registration panel and request a change. Suggestions appear in the preview first.";

const $ = (id) => document.getElementById(id);
const names = { title: "Title", intro: "Description", illustration: "Illustration", meta: "Date and place", registration: "Registration panel" };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

function addActivity(message) { activity.unshift(message); activity = activity.slice(0, 6); }
function describeStyle(style) { return style === "readability" ? "Larger type and stronger contrast" : style === "playful" ? "Playful pink accent; type size unchanged" : "Original style"; }
function renderPoster(target, state, interactive) {
  const c = state.components;
  target.innerHTML = `
    <div class="poster-item poster-title" data-id="title" tabindex="${interactive ? 0 : -1}" ${interactive ? 'role="button" aria-label="Select title"' : ''}>${escapeHtml(c.title.text)}</div>
    <div class="poster-item poster-intro" data-id="intro" tabindex="${interactive ? 0 : -1}" ${interactive ? 'role="button" aria-label="Select description"' : ''}>${escapeHtml(c.intro.text)}</div>
    <div class="poster-item poster-illustration" data-id="illustration" tabindex="${interactive ? 0 : -1}" ${interactive ? 'role="button" aria-label="Select illustration"' : ''}><div class="orb" aria-hidden="true">✦</div></div>
    <div class="poster-item poster-meta" data-id="meta" tabindex="${interactive ? 0 : -1}" ${interactive ? 'role="button" aria-label="Select date and place"' : ''}>${escapeHtml(c.meta.text).replace(/\n/g, "<br>")}</div>
    <div class="poster-item poster-registration ${escapeHtml(c.registration.style)}" data-id="registration" tabindex="${interactive ? 0 : -1}" ${interactive ? 'role="button" aria-label="Select registration panel"' : ''}><span>${escapeHtml(c.registration.text)}</span><span class="arrow" aria-hidden="true">↗</span></div>`;
  if (interactive) {
    target.querySelectorAll(".poster-item").forEach((item) => {
      if (item.dataset.id === selected) item.classList.add("selected");
      const choose = () => { selected = item.dataset.id; render(); };
      item.addEventListener("click", choose);
      item.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); } });
    });
  }
}

function validateProposal(candidate) {
  if (candidate.baseVersion !== poster.version) return "The poster changed. Please generate a new suggestion.";
  if (candidate.targetId !== "registration" || selected !== "registration") return "The suggestion no longer matches the selected component.";
  if (poster.components.registration.locked) return "The registration panel is locked and cannot be changed.";
  if (!["readability", "playful"].includes(candidate.style)) return "This suggestion contains an unsupported style.";
  return null;
}

function setProposal(style) {
  if (selected !== "registration") { feedback = "This demo suggests changes only to the registration panel. Select it first."; render(); return; }
  if (poster.components.registration.locked) { feedback = "The registration panel is locked."; render(); return; }
  const intent = style === "readability"
    ? { origin: "System inference", text: "Stand out means improve readability", status: "Unconfirmed" }
    : { origin: "User correction", text: "Keep the type size; add a playful pink accent", status: "Explicit instruction" };
  proposal = { baseVersion: poster.version, targetId: "registration", style, intent };
  feedback = "Suggestion ready. The current poster has not changed.";
  addActivity(`${style === "readability" ? "Readability" : "Playful accent"} suggestion generated; not applied.`);
  render();
}

function applyProposal() {
  if (!proposal) return;
  const error = validateProposal(proposal);
  if (error) { proposal = null; feedback = error; render(); return; }
  undoStack.push(structuredClone(poster));
  poster.components.registration.style = proposal.style;
  poster.version += 1;
  poster.intent = { ...proposal.intent, status: "Confirmed" };
  const description = describeStyle(proposal.style);
  proposal = null;
  feedback = `Applied to the registration panel only: ${description}. You can undo this change.`;
  addActivity(`Registration panel changed: ${description}.`);
  render();
}

function undo() {
  if (!undoStack.length) return;
  const nextVersion = poster.version + 1;
  poster = undoStack.pop();
  poster.version = nextVersion;
  proposal = null;
  feedback = "Undone. The registration panel is back to its previous style; title and illustration remain locked.";
  addActivity("Last applied change undone.");
  render();
}

function render() {
  $("version").textContent = `Revision ${poster.version}`;
  $("selection-name").textContent = names[selected];
  $("selection-detail").textContent = selected === "registration" ? "This suggestion can change only the registration panel's visual style." : "You can inspect this component. Suggestions in this demo target only the registration panel.";
  $("lock-state").innerHTML = Object.entries(poster.components).map(([id, item]) => `<span class="tag ${item.locked ? "locked" : ""}">${item.locked ? "🔒 " : ""}${names[id]}</span>`).join("");
  const visibleIntent = proposal ? proposal.intent : poster.intent;
  $("intent").innerHTML = visibleIntent ? `<strong>${escapeHtml(visibleIntent.origin)}</strong> · ${escapeHtml(visibleIntent.status)}<br>${escapeHtml(visibleIntent.text)}` : "No interpretation has been proposed yet.";
  $("feedback").textContent = feedback;
  $("history").innerHTML = activity.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $("undo").disabled = undoStack.length === 0;
  renderPoster($("current-poster"), poster, true);
  $("preview-wrap").hidden = !proposal;
  $("canvas-grid").classList.toggle("has-preview", !!proposal);
  $("current-status").textContent = proposal ? "UNCHANGED" : "";
  if (proposal) {
    const preview = structuredClone(poster);
    preview.components.registration.style = proposal.style;
    renderPoster($("preview-poster"), preview, false);
    $("proposal").innerHTML = `<strong>Scope: registration panel only</strong><ul><li>Style: ${escapeHtml(describeStyle(proposal.style))}</li><li>Title and illustration stay locked; other components stay unchanged</li><li>This preview is not part of the current poster</li></ul>`;
    $("actions").innerHTML = `<button id="apply" class="primary">Apply to registration</button>${proposal.style === "readability" ? '<button id="correct" class="secondary">Correct: I meant playful</button>' : ''}<button id="discard" class="secondary">Discard preview</button>`;
    $("apply").addEventListener("click", applyProposal);
    if (proposal.style === "readability") $("correct").addEventListener("click", () => setProposal("playful"));
    $("discard").addEventListener("click", () => { proposal = null; feedback = "Preview discarded. The current poster has not changed."; addActivity("Suggestion discarded."); render(); });
  } else {
    $("proposal").textContent = "No suggestion is waiting for approval.";
    $("actions").innerHTML = "";
  }
}

$("propose").addEventListener("click", () => {
  const request = $("request").value.trim();
  if (selected !== "registration") { feedback = "Select the registration panel first."; render(); return; }
  if (/playful|pink|fun|colourful|colorful/i.test(request)) setProposal("playful");
  else if (/stand out|prominent|readab|contrast|clearer/i.test(request)) setProposal("readability");
  else { proposal = null; feedback = "I am not sure what you mean. Should the panel be easier to read, or have a playful visual accent?"; addActivity("Unclear request; waiting for clarification."); render(); }
});
$("undo").addEventListener("click", undo);
render();
