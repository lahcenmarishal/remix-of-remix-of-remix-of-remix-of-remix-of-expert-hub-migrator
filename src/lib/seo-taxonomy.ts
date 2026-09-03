/**
 * Taxonomie SEO curatée : uniquement les villes, matières et niveaux qui
 * correspondent à une vraie intention de recherche et à des données réelles.
 * Aucune génération massive de pages : les listes ci-dessous sont volontairement
 * courtes et l'indexation dépend de la présence de professeurs réels.
 */
import { LEVELS, SERVICES } from "@/lib/catalog";
import { CITIES } from "@/lib/cities";
import { SITE_URL } from "@/lib/blog";
import type { ProfessionalRow } from "@/lib/marketplace";

export type SeoLang = "fr" | "ar";

export type SeoCity = { slug: string; fr: string; ar: string; cityName: string };
export type SeoSubject = { slug: string; fr: string; ar: string; match: string[] };
export type SeoLevel = { slug: string; fr: string; ar: string; cycle: string };

/* ------------------------------------------------------------------ */
/* Villes (les 20 plus recherchées, toutes présentes dans le catalogue) */
/* ------------------------------------------------------------------ */

const CITY_DEFS: Array<[string, string, string]> = [
  ["casablanca", "Casablanca", "الدار البيضاء"],
  ["rabat", "Rabat", "الرباط"],
  ["marrakech", "Marrakech", "مراكش"],
  ["fes", "Fès", "فاس"],
  ["tanger", "Tanger", "طنجة"],
  ["agadir", "Agadir", "أكادير"],
  ["meknes", "Meknès", "مكناس"],
  ["oujda", "Oujda", "وجدة"],
  ["kenitra", "Kénitra", "القنيطرة"],
  ["tetouan", "Tétouan", "تطوان"],
  ["sale", "Salé", "سلا"],
  ["temara", "Témara", "تمارة"],
  ["mohammedia", "Mohammedia", "المحمدية"],
  ["el-jadida", "El Jadida", "الجديدة"],
  ["safi", "Safi", "آسفي"],
  ["beni-mellal", "Béni Mellal", "بني ملال"],
  ["nador", "Nador", "الناظور"],
  ["khouribga", "Khouribga", "خريبكة"],
  ["settat", "Settat", "سطات"],
  ["essaouira", "Essaouira", "الصويرة"],
];

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/** Ville retenue uniquement si elle existe réellement dans le catalogue. */
export const SEO_CITIES: SeoCity[] = CITY_DEFS.flatMap(([slug, fr, ar]) => {
  const row = CITIES.find((c) => norm(c.name) === norm(fr) && c.is_active);
  return row ? [{ slug, fr, ar, cityName: row.name }] : [];
});

export const findCity = (slug?: string) => SEO_CITIES.find((c) => c.slug === slug) ?? null;
export const cityIdsOf = (city: SeoCity) =>
  CITIES.filter((c) => norm(c.name) === norm(city.cityName)).map((c) => c.id);

/* ------------------------------------------------------------------ */
/* Matières (intentions de recherche réelles)                          */
/* ------------------------------------------------------------------ */

export const SEO_SUBJECTS: SeoSubject[] = [
  { slug: "mathematiques", fr: "Mathématiques", ar: "الرياضيات", match: ["mathematiques", "maths"] },
  { slug: "physique-chimie", fr: "Physique-Chimie", ar: "الفيزياء والكيمياء", match: ["physique", "chimie"] },
  { slug: "svt", fr: "SVT", ar: "علوم الحياة والأرض", match: ["svt", "sciences de la vie", "biologie"] },
  { slug: "francais", fr: "Français", ar: "الفرنسية", match: ["francais"] },
  { slug: "anglais", fr: "Anglais", ar: "الإنجليزية", match: ["anglais", "english"] },
  { slug: "arabe", fr: "Arabe", ar: "اللغة العربية", match: ["arabe"] },
  { slug: "philosophie", fr: "Philosophie", ar: "الفلسفة", match: ["philosophie"] },
  { slug: "informatique", fr: "Informatique", ar: "المعلوميات", match: ["informatique", "programmation", "developpement"] },
  { slug: "economie-gestion", fr: "Économie & Gestion", ar: "الاقتصاد والتدبير", match: ["economie", "gestion", "comptabilite", "finance"] },
  { slug: "histoire-geographie", fr: "Histoire-Géographie", ar: "التاريخ والجغرافيا", match: ["histoire", "geographie"] },
];

export const findSubject = (slug?: string) => SEO_SUBJECTS.find((s) => s.slug === slug) ?? null;

const SERVICE_NAME_BY_ID = new Map(SERVICES.map((s) => [s.id, norm(s.name)]));

export function serviceMatchesSubject(serviceId: string, subject: SeoSubject) {
  const name = SERVICE_NAME_BY_ID.get(serviceId);
  if (!name) return false;
  return subject.match.some((m) => name.includes(m));
}

/* ------------------------------------------------------------------ */
/* Niveaux (cycles réels du catalogue)                                 */
/* ------------------------------------------------------------------ */

export const SEO_LEVELS: SeoLevel[] = [
  { slug: "primaire", fr: "Primaire", ar: "الابتدائي", cycle: "Primaire" },
  { slug: "college", fr: "Collège", ar: "الإعدادي", cycle: "Collège" },
  { slug: "lycee", fr: "Lycée", ar: "الثانوي", cycle: "Lycée" },
  { slug: "superieur", fr: "Supérieur", ar: "التعليم العالي", cycle: "Supérieur" },
];

export const findLevel = (slug?: string) => SEO_LEVELS.find((l) => l.slug === slug) ?? null;

const LEVEL_IDS_BY_CYCLE = new Map(
  SEO_LEVELS.map((l) => [l.slug, new Set(LEVELS.filter((x) => x.cycle === l.cycle).map((x) => x.id))]),
);

/* ------------------------------------------------------------------ */
/* Filtrage des professeurs réels                                      */
/* ------------------------------------------------------------------ */

export type SeoFilter = {
  city?: SeoCity | null;
  subject?: SeoSubject | null;
  level?: SeoLevel | null;
};

export function filterPros(pros: ProfessionalRow[], f: SeoFilter): ProfessionalRow[] {
  const cityIds = f.city ? new Set(cityIdsOf(f.city)) : null;
  const levelIds = f.level ? LEVEL_IDS_BY_CYCLE.get(f.level.slug) : null;
  return pros.filter((p) => {
    if (cityIds && !(p.city_id && cityIds.has(p.city_id))) return false;
    if (f.subject && !p.professional_services.some((s) => serviceMatchesSubject(s.service_id, f.subject!)))
      return false;
    if (levelIds && !p.professional_levels.some((l) => levelIds.has(l.level_id))) return false;
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* Slugs professeurs                                                    */
/* ------------------------------------------------------------------ */

export const slugify = (s: string) =>
  norm(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const proSlug = (pro: { id: string; display_name: string }) =>
  `${slugify(pro.display_name) || "professeur"}-${pro.id.slice(0, 8)}`;

export function findProBySlug(pros: ProfessionalRow[], slug: string) {
  const suffix = slug.slice(slug.lastIndexOf("-") + 1);
  return pros.find((p) => p.id.startsWith(suffix)) ?? pros.find((p) => proSlug(p) === slug) ?? null;
}

/* ------------------------------------------------------------------ */
/* Métadonnées SEO                                                      */
/* ------------------------------------------------------------------ */

export const otherLang = (lang: SeoLang): SeoLang => (lang === "fr" ? "ar" : "fr");

export type HeadInput = {
  lang: SeoLang;
  path: string; // sans le préfixe de langue, ex. "/professeurs/casablanca"
  title: string;
  description: string;
  /** false → noindex,follow (page sans données réelles suffisantes) */
  index?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export function seoHead({ lang, path, title, description, index = true, jsonLd }: HeadInput) {
  const url = `${SITE_URL}/${lang}${path}`;
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:locale", content: lang === "fr" ? "fr_MA" : "ar_MA" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (!index) meta.push({ name: "robots", content: "noindex,follow" });
  const head: Record<string, unknown> = {
    meta,
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "fr", href: `${SITE_URL}/fr${path}` },
      { rel: "alternate", hrefLang: "ar", href: `${SITE_URL}/ar${path}` },
      { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}/fr${path}` },
    ],
  };
  if (jsonLd) {
    head["scripts"] = [
      { type: "application/ld+json", children: JSON.stringify(jsonLd) },
    ];
  }
  return head;
}

export function breadcrumbLd(lang: SeoLang, items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}/${lang}${it.path}`,
    })),
  };
}
