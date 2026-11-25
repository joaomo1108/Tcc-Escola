import { useEffect, useRef, useState } from "react";
import { Accessibility, Eye, Volume2, X, Type, RotateCcw } from "lucide-react";

type Prefs = {
  blind: boolean;
  font: "normal" | "large";
};

const DEFAULT_PREFS: Prefs = {
  blind: false,
  font: "normal",
};

function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  root.setAttribute("data-a11y-blind", prefs.blind ? "true" : "false");
  root.setAttribute("data-font", prefs.font);
}

function speakText(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(clean.slice(0, 500));
  utter.lang = "pt-BR";
  utter.rate = 1;
  window.speechSynthesis.speak(utter);
}

function speakPage() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    alert("Seu navegador não suporta leitura por voz.");
    return;
  }
  window.speechSynthesis.cancel();
  const main = document.querySelector("main") || document.body;
  const text = (main as HTMLElement).innerText.replace(/\s+/g, " ").trim().slice(0, 6000);
  if (!text) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "pt-BR";
  utter.rate = 1;
  window.speechSynthesis.speak(utter);
}

function stopSpeak() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function getSpeakableTarget(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  if (el.closest("#a11y-panel")) return null;
  return el.closest(
    "h1,h2,h3,h4,h5,h6,p,li,button,a,label,dt,dd,th,td,figcaption,legend"
  ) as HTMLElement | null;
}

function getSpeakableText(el: HTMLElement | null): string {
  const target = getSpeakableTarget(el);
  if (!target) return "";
  const text = (target.innerText || target.getAttribute("aria-label") || "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < 2) return "";
  return text.slice(0, 280);
}

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(() => {
    if (typeof document !== "undefined") applyPrefs(DEFAULT_PREFS);
    return DEFAULT_PREFS;
  });
  const lastSpokenRef = useRef("");
  const lastTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    applyPrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    if (!prefs.blind) {
      stopSpeak();
      lastSpokenRef.current = "";
      lastTargetRef.current = null;
      return;
    }

    let timer: number | undefined;
    const handle = (event: Event) => {
      const el = event.target as HTMLElement | null;
      const target = getSpeakableTarget(el);
      const text = getSpeakableText(el);
      if (!target || !text) return;
      // Permite reler o mesmo texto se o usuário saiu e voltou ao elemento.
      if (target === lastTargetRef.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        lastTargetRef.current = target;
        lastSpokenRef.current = text;
        speakText(text);
      }, 150);
    };

    const handleOut = (event: Event) => {
      const el = event.target as HTMLElement | null;
      const target = getSpeakableTarget(el);
      if (target && target === lastTargetRef.current) {
        lastTargetRef.current = null;
      }
    };

    document.addEventListener("mouseover", handle);
    document.addEventListener("focusin", handle);
    document.addEventListener("mouseout", handleOut);
    document.addEventListener("focusout", handleOut);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseover", handle);
      document.removeEventListener("focusin", handle);
      document.removeEventListener("mouseout", handleOut);
      document.removeEventListener("focusout", handleOut);
    };
  }, [prefs.blind]);

  const update = (patch: Partial<Prefs>) =>
    setPrefs((current) => ({ ...current, ...patch }));

  const reset = () => {
    stopSpeak();
    lastSpokenRef.current = "";
    lastTargetRef.current = null;
    setPrefs(DEFAULT_PREFS);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-32 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        style={{ backgroundColor: "#0E7A50", color: "#FFFEDB", zIndex: 60 }}
        aria-label={open ? "Fechar painel de acessibilidade" : "Abrir painel de acessibilidade"}
        aria-expanded={open}
        aria-controls="a11y-panel"
      >
        <Accessibility size={22} />
      </button>

      {open && (
        <div
          id="a11y-panel"
          role="dialog"
          aria-label="Opções de acessibilidade"
          className="fixed bottom-48 right-4 w-[min(22rem,calc(100vw-2rem))] rounded-3xl shadow-2xl border p-5"
          style={{
            backgroundColor: "var(--panel-bg, #ffffff)",
            color: "var(--panel-fg, #383939)",
            borderColor: "rgba(56,57,57,0.15)",
            zIndex: 60,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Accessibility size={18} style={{ color: "#149C68" }} />
              <h2 className="text-sm font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                Acessibilidade
              </h2>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fechar" className="p-1.5 rounded-full hover:bg-black/5">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <ToggleRow
              icon={<Eye size={16} />}
              label="Modo para pessoas cegas"
              description="Ao passar o mouse ou focar em um texto, o site lê em voz alta."
              checked={prefs.blind}
              onChange={(v) => update({ blind: v })}
            />

            <ToggleRow
              icon={<Type size={16} />}
              label="Texto maior"
              description="Aumenta o tamanho do texto em todo o site."
              checked={prefs.font === "large"}
              onChange={(v) => update({ font: v ? "large" : "normal" })}
            />
          </div>

          {prefs.blind && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(56,57,57,0.12)" }}>
              <p className="text-xs mb-2" style={{ color: "var(--muted-foreground, #5a6060)" }}>
                Leitura por voz:
              </p>
              <div className="flex gap-2">
                <button
                  onClick={speakPage}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ backgroundColor: "#0E7A50", color: "#FFFEDB" }}
                >
                  <Volume2 size={14} /> Ler página
                </button>
                <button
                  onClick={stopSpeak}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border"
                  style={{ borderColor: "rgba(56,57,57,0.2)" }}
                >
                  Parar
                </button>
              </div>
              <p className="text-[11px] mt-2" style={{ color: "var(--muted-foreground, #5a6060)" }}>
                Dica: passe o mouse sobre um texto para ouvi-lo.
              </p>
            </div>
          )}

          <button
            onClick={reset}
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border hover:bg-black/5"
            style={{ borderColor: "rgba(56,57,57,0.15)" }}
          >
            <RotateCcw size={13} /> Restaurar padrão
          </button>
        </div>
      )}
    </>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = `a11y-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 p-3 rounded-2xl cursor-pointer hover:bg-black/5"
      style={{ backgroundColor: checked ? "rgba(20,156,104,0.08)" : "transparent" }}
    >
      <div className="mt-0.5" style={{ color: "#149C68" }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">{label}</span>
          <span
            aria-hidden="true"
            className="relative inline-flex w-10 h-6 rounded-full transition-colors shrink-0"
            style={{ backgroundColor: checked ? "#0E7A50" : "rgba(56,57,57,0.25)" }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ left: checked ? "18px" : "2px" }}
            />
          </span>
        </div>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted-foreground, #5a6060)" }}>
          {description}
        </p>
      </div>
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}