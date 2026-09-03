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

/** Formulations locales autour d'une ville (intentions réelles de recherche). */
export const localIntentLinks = (lang: SeoLang, city: SeoCity): SeoLinkItem[] => {
  const items: SeoLinkItem[] = [
    {
      to: "/$lang/cours-particuliers/$ville",
      params: { lang, ville: city.slug },
      label: lang === "fr" ? `Cours particuliers à ${city.fr}` : `دروس خصوصية ${city.arIn}`,
    },
    {
      to: "/$lang/villes/$ville",
      params: { lang, ville: city.slug },
      label: lang === "fr" ? `Soutien scolaire à ${city.fr}` : `الدعم المدرسي ${city.arBi}`,
    },
  ];
  const featured = ["mathematiques", "physique-chimie", "francais", "anglais"];
  for (const slug of featured) {
    const s = SEO_SUBJECTS.find((x) => x.slug === slug);
    if (!s) continue;
    items.push({
      to: "/$lang/professeurs/$ville/$matiere",
      params: { lang, ville: city.slug, matiere: s.slug },
      label: lang === "fr" ? `Professeur de ${s.fr.toLowerCase()} à ${city.fr}` : `${s.arTeacher} ${city.arIn}`,
    });
    items.push({
      to: "/$lang/cours-particuliers/$ville/$matiere",
      params: { lang, ville: city.slug, matiere: s.slug },
      label:
        lang === "fr"
          ? `Cours de ${s.fr.toLowerCase()} à domicile à ${city.fr}`
          : `دروس ${s.ar} في المنزل ${city.arBi}`,
    });
  }
  return items;
};

/** Lien direct vers la page ville dédiée. */
export const cityPageLink = (lang: SeoLang, city: SeoCity): SeoLinkItem => ({
  to: "/$lang/villes/$ville",
  params: { lang, ville: city.slug },
  label: lang === "fr" ? `Tout sur ${city.fr}` : `كل شيء ${city.arBi}`,
});
