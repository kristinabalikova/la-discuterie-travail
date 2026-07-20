import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, History, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { QUESTIONS, getQuestionsByMode, type QuestionItem, type QuestionMode } from "./questionsData";

type SpinStatus = "ready" | "spinning" | "done";

type ReelState = {
  id: number;
  items: QuestionItem[];
  result: QuestionItem;
  offset: number;
  finalOffset: number;
  duration: number;
};

type HistoryEntry = {
  id: number;
  text: string;
  time: string;
};

const FALLBACK_ITEM_HEIGHT = 156;
const FILLER_LENGTH = 26;
const SPIN_DURATION = 2200;
const HISTORY_LIMIT = 8;
const CYCLE_MESSAGE = "Toutes les questions sont passées, on repart pour un tour.";

const MODE_LABELS: Record<QuestionMode, string> = {
  tout: "Tout",
  affirmation: "Affirmations",
  question: "Questions",
};

const MODE_OPTIONS: QuestionMode[] = ["tout", "affirmation", "question"];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDeck(pool: QuestionItem[] = QUESTIONS, avoidId: string | null = null): QuestionItem[] {
  const shuffled = shuffle(pool);
  if (avoidId && shuffled.length > 1 && shuffled[shuffled.length - 1].id === avoidId) {
    const swapIndex = Math.floor(Math.random() * (shuffled.length - 1));
    const last = shuffled.length - 1;
    [shuffled[last], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[last]];
  }
  return shuffled;
}

function buildPreviewReel(pool: QuestionItem[] = QUESTIONS): ReelState {
  const result = pickRandom(pool);
  const items = [pickRandom(pool), result, pickRandom(pool)];
  return { id: 0, items, result, offset: 0, finalOffset: 0, duration: 0 };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function App() {
  const [mode, setMode] = useState<QuestionMode>("tout");
  const pool = useMemo(() => getQuestionsByMode(mode), [mode]);

  const [unique, setUnique] = useState(true);
  const [status, setStatus] = useState<SpinStatus>("ready");
  const [result, setResult] = useState<QuestionItem | null>(null);
  const [reel, setReel] = useState<ReelState>(() => buildPreviewReel(pool));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [deckCycled, setDeckCycled] = useState(false);

  const reelRef = useRef<HTMLDivElement | null>(null);
  const reelTrackRef = useRef<HTMLDivElement | null>(null);
  const spinTimerRef = useRef<number | null>(null);
  const spinRunRef = useRef(0);
  const deckRef = useRef<QuestionItem[]>([]);
  const lastDrawnIdRef = useRef<string | null>(null);
  const pendingCycledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) {
        window.clearTimeout(spinTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (spinTimerRef.current) {
      window.clearTimeout(spinTimerRef.current);
    }
    deckRef.current = [];
    lastDrawnIdRef.current = null;
    setDeckCycled(false);
    setCopied(false);
    setResult(null);
    setStatus("ready");
    setReel(buildPreviewReel(pool));
  }, [pool]);

  function measureItemHeight(): number {
    const el = reelRef.current;
    if (!el) {
      return FALLBACK_ITEM_HEIGHT;
    }
    const height = el.getBoundingClientRect().height / 3;
    return height > 0 ? height : FALLBACK_ITEM_HEIGHT;
  }

  function drawUniqueQuestion(): { question: QuestionItem; cycled: boolean } {
    if (deckRef.current.length === 0) {
      deckRef.current = buildDeck(pool, lastDrawnIdRef.current);
    }
    const question = deckRef.current.pop()!;
    lastDrawnIdRef.current = question.id;
    const cycled = deckRef.current.length === 0;
    return { question, cycled };
  }

  function handleUniqueChange(checked: boolean) {
    setUnique(checked);
    if (checked) {
      deckRef.current = [];
      lastDrawnIdRef.current = null;
      setDeckCycled(false);
    }
  }

  function spin() {
    if (status === "spinning") {
      return;
    }

    if (spinTimerRef.current) {
      window.clearTimeout(spinTimerRef.current);
    }

    let target: QuestionItem;
    let cycled = false;

    if (unique) {
      const draw = drawUniqueQuestion();
      target = draw.question;
      cycled = draw.cycled;
    } else {
      target = pickRandom(pool);
    }

    pendingCycledRef.current = cycled;

    const itemHeight = measureItemHeight();
    const reducedMotion = prefersReducedMotion();
    const spinDuration = reducedMotion ? 50 : SPIN_DURATION;
    const finishDelay = reducedMotion ? 120 : spinDuration + 250;

    const items = Array.from({ length: FILLER_LENGTH }, () => pickRandom(pool));
    const targetIndex = items.length;
    items.push(target, pickRandom(pool), pickRandom(pool));

    // RESET PHASE: offset 0, duration 0 — instant jump to the top, no animation.
    const nextReel: ReelState = {
      id: ++spinRunRef.current,
      items,
      result: target,
      offset: 0,
      finalOffset: itemHeight - targetIndex * itemHeight,
      duration: 0,
    };

    setCopied(false);
    setResult(null);
    setDeckCycled(false);
    setStatus("spinning");
    setReel(nextReel);

    window.requestAnimationFrame(() => {
      if (reelTrackRef.current) {
        void reelTrackRef.current.offsetHeight; // force reflow so the reset paint (offset 0, duration 0) commits before we animate
      }
      window.requestAnimationFrame(() => {
        // SPIN PHASE: duration and offset change together in the same commit.
        setReel((current) => ({ ...current, offset: current.finalOffset, duration: spinDuration }));
      });
    });

    spinTimerRef.current = window.setTimeout(() => {
      const time = new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setResult(target);
      setStatus("done");
      setDeckCycled(pendingCycledRef.current);
      setHistory((current) =>
        [{ id: Date.now(), text: target.text, time }, ...current].slice(0, HISTORY_LIMIT),
      );
    }, finishDelay);
  }

  async function copyResult() {
    if (!result) {
      return;
    }
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function reset() {
    if (spinTimerRef.current) {
      window.clearTimeout(spinTimerRef.current);
    }
    setResult(null);
    setCopied(false);
    setStatus("ready");
    setDeckCycled(false);
    setReel(buildPreviewReel(pool));
  }

  return (
    <main className="app-shell">
      <section className="workspace" aria-label="La Discuterie Travail">
        <header className="app-header">
          <div>
            <p className="eyebrow">La Discuterie</p>
            <h1>Travail</h1>
          </div>
          <div className="brand-mark" aria-hidden="true">
            <span>💼</span>
          </div>
        </header>

        <div className="controls-bar">
          <div className="set-grid" role="group" aria-label="Mode de tirage">
            {MODE_OPTIONS.map((option) => (
              <button
                className={`set-pill${mode === option ? " active" : ""}`}
                disabled={status === "spinning"}
                key={option}
                onClick={() => setMode(option)}
                type="button"
              >
                {MODE_LABELS[option]}
              </button>
            ))}
          </div>
          <label className="toggle">
            <input
              checked={unique}
              disabled={status === "spinning"}
              onChange={(event) => handleUniqueChange(event.target.checked)}
              type="checkbox"
            />
            <span>Sans doublons</span>
          </label>
        </div>

        <section className="slot-machine">
          <div className="machine-top">
            <div className="light-row" aria-hidden="true">
              {Array.from({ length: 10 }).map((_, index) => (
                <span key={index} />
              ))}
            </div>
            <div className="machine-title">
              <Sparkles size={18} aria-hidden="true" />
              <span>{status === "spinning" ? "Tirage..." : MODE_LABELS[mode]}</span>
            </div>
          </div>

          <div className="reel-stage">
            <div className="reel" ref={reelRef}>
              <div className="payline" aria-hidden="true" />
              <div
                className="reel-track"
                ref={reelTrackRef}
                key={reel.id}
                data-final-offset={reel.finalOffset}
                data-duration={reel.duration}
                style={{
                  transform: `translate3d(0, ${reel.offset}px, 0)`,
                  transitionDuration: `${reel.duration}ms`,
                }}
              >
                {reel.items.map((item, index) => (
                  <span className="reel-item" key={`${reel.id}-${index}-${item.id}`}>
                    {item.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="action-row">
          <button
            className="primary-action"
            disabled={status === "spinning"}
            onClick={spin}
            type="button"
          >
            <Sparkles size={20} aria-hidden="true" />
            {status === "spinning" ? "Ça tourne" : "Lancer"}
          </button>
          <button
            className="icon-action"
            disabled={status === "spinning"}
            onClick={reset}
            title="Réinitialiser"
            type="button"
          >
            <RotateCcw size={20} aria-hidden="true" />
          </button>
        </div>

        {status === "done" && result && (
          <section aria-live="polite" className="result-panel">
            <div className="result-line">
              <span>{result.text}</span>
              <button className="copy-button" onClick={copyResult} type="button">
                {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
            {deckCycled && <p className="cycle-note">{CYCLE_MESSAGE}</p>}
          </section>
        )}

        {history.length > 0 && (
          <section className="history-panel">
            <div className="history-heading">
              <div>
                <History size={18} aria-hidden="true" />
                <span>Historique</span>
              </div>
              <button
                className="ghost-icon"
                onClick={() => setHistory([])}
                title="Effacer l'historique"
                type="button"
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>
            <div className="history-list">
              {history.map((entry) => (
                <button
                  className="history-item"
                  key={entry.id}
                  onClick={() => navigator.clipboard.writeText(entry.text)}
                  title="Copier cette affirmation"
                  type="button"
                >
                  <span>{entry.text}</span>
                  <small>{entry.time}</small>
                </button>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
