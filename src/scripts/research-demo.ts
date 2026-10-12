// Autoplay engine for the animated research demo (#3796, lead-remediated).
//
// A declarative timeline drives a clock that only advances while the demo is
// on screen and the visitor has not interacted with it: type the query,
// engage the run chip, then auto-advance through the provider tabs — each
// provider shows its running state, reveals its captured card, and dwells
// before the next — settling on a browsable single-panel output. Click,
// touch, key press, or focus inside the demo stops autoplay permanently
// (never incidental pointer movement); the explicit Replay button restarts
// exactly one cycle. Provider switching stays available before, during, and
// after takeover. Reduced motion (including enabling it mid-playback) stops
// the clock and renders the complete static output; offscreen the clock
// freezes with hysteresis so content-height changes cannot oscillate it.

import { RESEARCH_DEMO_QUERY } from "../data/research-demo";

const CHAR_MS = 34;
const RUN_AT = 350;
const RUN_FOR = 450;
const RUN_AFTER_TYPING = 900;
// Each provider gets a visible "running" beat, a streamed reveal of its answer
// (one block at a time, see REVEAL_STEP_MS), and time to read before moving on.
const SEGMENT_RUNNING = 1500;
const SEGMENT_REVEAL = 3000;
const SEGMENT_DWELL = 3200;
const SEGMENT_TOTAL = SEGMENT_RUNNING + SEGMENT_REVEAL + SEGMENT_DWELL;
const READING_PAUSE = 4200;
// Streamed reveal: the answer appears word by word, like a model streaming its
// output. Words are paced so every answer finishes within the reveal window.
const REVEAL_WORD_MS_MAX = 45;
const REVEAL_BUDGET_MS = SEGMENT_REVEAL - 400;
const VISIBLE_RATIO = 0.35;
const HIDDEN_RATIO = 0.05;

export function initResearchDemo(): void {
  const maybeRegion = document.getElementById("research-example");
  if (!maybeRegion) return;
  const region = maybeRegion; // narrowed alias captured by the helpers below
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  const typed = document.getElementById("demo-typed");
  const action = document.getElementById("demo-action");
  const replay = document.querySelector<HTMLButtonElement>("#demo-replay");
  const tabs = [...region.querySelectorAll<HTMLButtonElement>("[data-demo-tab]")];
  const panels = [...region.querySelectorAll<HTMLElement>("[data-demo-panel]")];
  if (tabs.length === 0 || panels.length === 0) return;

  const query = RESEARCH_DEMO_QUERY;
  const typingEnd = query.length * CHAR_MS;
  const runAt = typingEnd + RUN_AT;
  const providersAt = typingEnd + RUN_AFTER_TYPING;
  const cycle = providersAt + panels.length * SEGMENT_TOTAL + READING_PAUSE;
  const settleIndex = panels.findIndex((panel) => panel.dataset.demoFinal !== "failed");

  let mode: "idle" | "autoplay" | "single" | "stopped" = "idle";
  let interacted = false; // any manual interaction permanently suppresses autoplay
  let reduceSeen = reduce.matches; // once reduced motion is observed, playback stays off for good
  let inView = false;
  let frame = 0;
  let lastTick = 0;
  let elapsed = 0;

  // Browsing (tabs, panels, bodies) is always available; only playback needs
  // motion. The server-rendered static output is complete on its own.
  const canPlay = () => !reduce.matches && !reduceSeen && !interacted;

  // Each provider chip carries its run status (queued, running, or the
  // captured duration); there is no second provider row inside the panel.
  const statusOf = (index: number) => tabs[index]?.querySelector<HTMLElement>("[data-demo-status]") ?? null;
  const bodyOf = (panel: HTMLElement) => panel.querySelector<HTMLElement>("[data-demo-body]");

  // Wrap every word of each answer in a span that knows its position in the
  // stream, so CSS can fade the words in order while the panel plays. The
  // text content is unchanged, so copy, search, and screen readers are unaffected.
  for (const panel of panels) {
    const body = bodyOf(panel);
    if (!body) continue;
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if ((node.textContent ?? "").trim() !== "") nodes.push(node as Text);
    }
    let index = 0;
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const part of (node.textContent ?? "").split(/(\s+)/)) {
        if (part === "") continue;
        if (/^\s+$/.test(part)) {
          fragment.append(part);
          continue;
        }
        const word = document.createElement("span");
        word.dataset.demoWord = "";
        word.style.setProperty("--demo-word", String(index++));
        word.textContent = part;
        fragment.append(word);
      }
      node.replaceWith(fragment);
    }
    const stepMs = Math.min(REVEAL_WORD_MS_MAX, REVEAL_BUDGET_MS / Math.max(index, 1));
    panel.style.setProperty("--demo-word-ms", `${stepMs.toFixed(1)}ms`);
  }

  function select(index: number): void {
    for (const [i, tab] of tabs.entries()) {
      const active = i === index;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    }
    for (const [i, panel] of panels.entries()) panel.hidden = i !== index;
    // On narrow screens the chip strip scrolls sideways: keep the active chip
    // in view (only the strip scrolls, never the page).
    const tab = tabs[index];
    const strip = tab?.parentElement;
    if (tab && strip && strip.scrollWidth > strip.clientWidth) {
      const tabBox = tab.getBoundingClientRect();
      const stripBox = strip.getBoundingClientRect();
      const left = strip.scrollLeft + tabBox.left - stripBox.left - (strip.clientWidth - tabBox.width) / 2;
      strip.scrollTo({ left: Math.max(0, left), behavior: reduce.matches ? "auto" : "smooth" });
    }
  }

  function setPanelState(index: number, state: "queued" | "running" | "done"): void {
    const panel = panels[index];
    const status = statusOf(index);
    const body = bodyOf(panel);
    panel.dataset.demoState = state;
    if (tabs[index]) tabs[index].dataset.demoState = state;
    if (status) status.textContent = state === "running" ? "running" : state === "queued" ? "queued" : panel.dataset.demoFinal || "done";
    if (body) body.hidden = state !== "done";
  }

  function apply(time: number): void {
    const chars = Math.min(query.length, Math.floor(time / CHAR_MS));
    if (typed) typed.textContent = query.slice(0, chars);
    region.dataset.demoPhase = time < typingEnd ? "typing" : "running";
    if (action) {
      const engaged = time >= runAt && time < runAt + RUN_FOR;
      action.dataset.engaged = engaged ? "true" : "false";
    }
    const providerTime = time - providersAt;
    const activeSegment = Math.floor(providerTime / SEGMENT_TOTAL);
    for (const [index] of panels.entries()) {
      if (providerTime < 0) setPanelState(index, "queued");
      else if (index < activeSegment) setPanelState(index, "done");
      else if (index === activeSegment) {
        const within = providerTime % SEGMENT_TOTAL;
        setPanelState(index, within < SEGMENT_RUNNING ? "running" : "done");
        if (tabs[index]?.getAttribute("aria-selected") !== "true") select(index);
      } else setPanelState(index, "queued");
    }
  }

  function renderFinal(): void {
    region.dataset.demoPhase = "complete";
    region.dataset.demoPlaying = "false"; // manual browsing shows answers instantly
    if (action) action.dataset.engaged = "false";
    if (typed) typed.textContent = query;
    for (const [index] of panels.entries()) setPanelState(index, "done");
    if (replay && !reduceSeen) replay.hidden = false;
  }

  function begin(single: boolean): void {
    if (!canPlay()) return;
    mode = single ? "single" : "autoplay";
    region.dataset.demoPlaying = "true";
    elapsed = 0;
    if (replay) replay.hidden = true;
    if (typed) typed.textContent = "";
    for (const [index] of panels.entries()) setPanelState(index, "queued");
    select(0);
    startClock();
  }

  function tick(timestamp: number): void {
    elapsed += Math.min(timestamp - lastTick, 64);
    lastTick = timestamp;
    if (mode === "autoplay") {
      apply(elapsed % cycle);
    } else if (mode === "single") {
      if (elapsed >= cycle - READING_PAUSE) {
        stopClock();
        mode = "stopped";
        renderFinal();
        select(settleIndex >= 0 ? settleIndex : 0);
        return;
      }
      apply(elapsed);
    }
    frame = requestAnimationFrame(tick);
  }

  function startClock(): void {
    if (frame) return;
    lastTick = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function stopClock(): void {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function userTakesOver(): void {
    interacted = true;
    if (mode === "stopped") return;
    mode = "stopped";
    stopClock();
    renderFinal();
  }

  region.addEventListener("pointerdown", userTakesOver);
  region.addEventListener("keydown", userTakesOver);
  region.addEventListener("focusin", userTakesOver);

  // Provider tabs work before, during, and after autoplay: switching during
  // playback stops the timeline and leaves every output browsable.
  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", () => {
      userTakesOver();
      select(index);
    });
    tab.addEventListener("keydown", (event) => {
      let next: number;
      switch (event.key) {
        case "ArrowRight": next = (index + 1) % tabs.length; break;
        case "ArrowLeft": next = (index + tabs.length - 1) % tabs.length; break;
        case "Home": next = 0; break;
        case "End": next = tabs.length - 1; break;
        default: return;
      }
      event.preventDefault();
      userTakesOver();
      select(next);
      tabs[next].focus();
    });
  }

  region.addEventListener("click", (event) => {
    if (replay?.contains(event.target as Node)) {
      event.stopPropagation();
      interacted = false; // the deliberate replay is a fresh single cycle
      begin(true);
    }
  });

  // Enabling reduced motion stops playback for good — even from idle, so a
  // later intersection cannot begin autoplay — and it never restarts
  // automatically when the preference is disabled again.
  reduce.addEventListener("change", () => {
    if (reduce.matches) {
      reduceSeen = true;
      mode = "stopped";
      stopClock();
      renderFinal();
      if (replay) replay.hidden = true;
    }
  });

  // Hysteresis: fully visible at >= 35% intersection, hidden only below 5%,
  // so panel-height changes during playback cannot oscillate the observer.
  new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.intersectionRatio >= VISIBLE_RATIO) inView = true;
      else if (entry.intersectionRatio < HIDDEN_RATIO) inView = false;
    }
    if (inView) {
      if (mode === "idle" && canPlay()) begin(false); // first entry starts autoplay
      else if (mode === "autoplay" || mode === "single") startClock(); // resume after offscreen pause
    } else {
      stopClock(); // fully paused offscreen; the clock only moves on screen
    }
  }, { threshold: [0, HIDDEN_RATIO, VISIBLE_RATIO] }).observe(region);
}
