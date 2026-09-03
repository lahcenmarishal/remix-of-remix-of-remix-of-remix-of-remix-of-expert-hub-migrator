/** Maillage interne : listes de liens réutilisées par les pages SEO. */
import type { SeoLinkItem } from "@/components/seo-landing";
import { label, nav } from "@/lib/seo-copy";
import { SEO_CITIES, SEO_LEVELS, SEO_SUBJECTS, type SeoCity, type SeoLang } from "@/lib/seo-taxonomy";

export const homeCrumb = (lang: SeoLang): SeoLinkItem => ({
  to: "/$lang",
  params: { lang },
  label: nav("home", lang),
});

export const crumb = (
  lang: SeoLang,
  to: string,
  params: Record<string, string>,
  labelText: string,
): SeoLinkItem => ({ to, params: { lang, ...params }, label: labelText });

export const cityLinks = (lang: SeoLang, to = "/$lang/villes/$ville"): SeoLinkItem[] =>
  SEO_CITIES.map((c) => ({ to, params: { lang, ville: c.slug }, label: label.city(c, lang) }));

export const subjectLinks = (lang: SeoLang, to = "/$lang/matieres/$matiere"): SeoLinkItem[] =>
  SEO_SUBJECTS.map((s) => ({ to, params: { lang, matiere: s.slug }, label: label.subject(s, lang) }));

export const levelLinks = (lang: SeoLang, to = "/$lang/niveaux/$niveau"): SeoLinkItem[] =>
  SEO_LEVELS.map((l) => ({ to, params: { lang, niveau: l.slug }, label: label.level(l, lang) }));

/** Matières x une ville : /fr/professeurs/[ville]/[matiere] */
export const subjectsInCity = (lang: SeoLang, city: SeoCity): SeoLinkItem[] =>
  SEO_SUBJECTS.map((s) => ({
    to: "/$lang/professeurs/$ville/$matiere",
    params: { lang, ville: city.slug, matiere: s.slug },
    label:
      lang === "fr"
        ? `${s.fr} à ${city.fr}`
        : `${s.ar} في ${city.ar}`,
  }));

/** Villes x une matière : /fr/professeurs/[ville]/[matiere] */
export const citiesForSubject = (lang: SeoLang, matiere: string, frName: string, arName: string): SeoLinkItem[] =>
  SEO_CITIES.map((c) => ({
    to: "/$lang/professeurs/$ville/$matiere",
    params: { lang, ville: c.slug, matiere },
    label: lang === "fr" ? `${frName} à ${c.fr}` : `${arName} في ${c.ar}`,
  }));

/** Matières présentées comme premier segment : /fr/professeurs/[matiere] */
export const subjectSegmentLinks = (lang: SeoLang): SeoLinkItem[] =>
  SEO_SUBJECTS.map((s) => ({
    to: "/$lang/professeurs/$ville",
    params: { lang, ville: s.slug },
    label: label.subject(s, lang),
  }));
