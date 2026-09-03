import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AR } from "./translations.ar";

export type Lang = "fr" | "ar";

const STORAGE_KEY = "profinder_lang";

/** Langue choisie manuellement (mémorisée), sinon null. */
export function getStoredLang(): Lang | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "ar" || v === "fr" ? v : null;
  } catch {
    return null;
  }
}

/** Détection de la langue du navigateur/appareil : arabe → ar, sinon français. */
export function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return "fr";
  const list = [navigator.language, ...(navigator.languages ?? [])].filter(Boolean) as string[];
  for (const raw of list) {
    const code = raw.toLowerCase();
    if (code.startsWith("ar")) return "ar";
    if (code.startsWith("fr")) return "fr";
  }
  return "fr";
}

export function resolveInitialLang(): Lang {
  return getStoredLang() ?? detectBrowserLang();
}

/* ------------------------------------------------------------------ */
/* Traduction du rendu (texte + attributs) quand la langue est l'arabe  */
/* ------------------------------------------------------------------ */

const ATTRS = ["placeholder", "title", "aria-label", "alt"];
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"]);

const AR_KEYS = Object.keys(AR).sort((a, b) => b.length - a.length);

// Remplace de façon gloutonne les fragments français connus dans un texte mixte
// (ex. "🎓 Primaire, Collège, Lycée" ou "📍 Casablanca · 3 km").
function translateMixed(text: string): string | null {
  let out = "";
  let i = 0;
  let changed = false;
  while (i < text.length) {
    let matched = false;
    for (const key of AR_KEYS) {
      if (text.startsWith(key, i)) {
        const hit = AR[key];
        if (hit && hit !== key) changed = true;
        out += hit ?? key;
        i += key.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += text[i];
      i += 1;
    }
  }
  return changed ? out : null;
}

function lookup(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const key = trimmed.replace(/\s+/g, " ");
  const hit = AR[key];
  if (hit) {
    const before = raw.slice(0, raw.indexOf(trimmed[0]!));
    const after = raw.slice(raw.lastIndexOf(trimmed[trimmed.length - 1]!) + 1);
    return `${before}${hit}${after}`;
  }
  const mixed = translateMixed(key);
  if (!mixed) return null;
  const before = raw.slice(0, raw.indexOf(trimmed[0]!));
  const after = raw.slice(raw.lastIndexOf(trimmed[trimmed.length - 1]!) + 1);
  return `${before}${mixed}${after}`;
}

function translateNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement;
    if (parent && SKIP_TAGS.has(parent.tagName)) return;
    const next = lookup(node.nodeValue ?? "");
    if (next && next !== node.nodeValue) node.nodeValue = next;
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as Element;
  if (SKIP_TAGS.has(el.tagName)) return;

  for (const attr of ATTRS) {
    const value = el.getAttribute(attr);
    if (!value) continue;
    const next = lookup(value);
    if (next && next !== value) el.setAttribute(attr, next);
  }

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  for (const t of texts) translateNode(t);

  el.querySelectorAll("[placeholder],[title],[aria-label],[alt]").forEach((child) => {
    for (const attr of ATTRS) {
      const value = child.getAttribute(attr);
      if (!value) continue;
      const next = lookup(value);
      if (next && next !== value) child.setAttribute(attr, next);
    }
  });
}

function startArabicTranslation(): () => void {
  translateNode(document.body);
  const observer = new MutationObserver((records) => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === "characterData") translateNode(record.target);
      else if (record.type === "attributes" && record.target.nodeType === Node.ELEMENT_NODE) {
        const el = record.target as Element;
        const attr = record.attributeName!;
        const value = el.getAttribute(attr);
        if (value) {
          const next = lookup(value);
          if (next && next !== value) el.setAttribute(attr, next);
        }
      } else record.addedNodes.forEach(translateNode);
    }
    observe();
  });
  const observe = () =>
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS,
    });
  observe();
  return () => observer.disconnect();
}

/* ------------------------------------------------------------------ */

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (fr: string) => string };

const LanguageContext = createContext<Ctx>({ lang: "fr", setLang: () => {}, t: (fr) => fr });

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  // Premier accès : détection automatique. Choix mémorisé : on le respecte.
  useEffect(() => {
    setLangState(resolveInitialLang());
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    if (lang !== "ar") return;
    return startArabicTranslation();
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* stockage indisponible */
    }
    // Rechargement : garantit un rendu propre dans la nouvelle langue.
    window.location.reload();
  }, []);

  const t = useCallback((fr: string) => (lang === "ar" ? (AR[fr] ?? fr) : fr), [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className={`inline-flex items-center rounded-full border border-border p-0.5 text-xs font-bold ${className}`}
      role="group"
      aria-label="Langue"
    >
      {(["fr", "ar"] as Lang[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => code !== lang && setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-2.5 py-1 transition ${
            lang === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"
          }`}
        >
          {code === "fr" ? "FR" : "ع"}
        </button>
      ))}
    </div>
  );
}
