import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL, fetchPublishedPosts } from "@/lib/blog";
import { fetchProfessionals } from "@/lib/marketplace";
import {
  SEO_CITIES,
  SEO_LEVELS,
  SEO_SUBJECTS,
  filterPros,
  proSlug,
} from "@/lib/seo-taxonomy";

const LANGS = ["fr", "ar"] as const;

/**
 * Sitemap : uniquement les pages utiles — hubs éditoriaux, villes et matières
 * curatées, combinaisons ville × matière (× niveau) qui ont au moins un
 * professeur réel, fiches professeurs actives et articles publiés.
 */
async function buildUrls(): Promise<string[]> {
  const paths = new Set<string>();
  const add = (p: string) => LANGS.forEach((l) => paths.add(`/${l}${p}`));

  add("");
  add("/professeurs");
  add("/cours-particuliers");
  add("/matieres");
  add("/villes");
  add("/niveaux");
  add("/blog");

  for (const s of SEO_SUBJECTS) {
    add(`/matieres/${s.slug}`);
    add(`/professeurs/${s.slug}`);
  }
  for (const l of SEO_LEVELS) add(`/niveaux/${l.slug}`);

  const pros = await fetchProfessionals().catch(() => []);

  for (const c of SEO_CITIES) {
    const inCity = filterPros(pros, { city: c });
    if (inCity.length === 0) continue;
    add(`/villes/${c.slug}`);
    add(`/professeurs/${c.slug}`);
    add(`/cours-particuliers/${c.slug}`);
    for (const s of SEO_SUBJECTS) {
      const withSubject = filterPros(inCity, { subject: s });
      if (withSubject.length === 0) continue;
      add(`/professeurs/${c.slug}/${s.slug}`);
      add(`/cours-particuliers/${c.slug}/${s.slug}`);
      for (const lv of SEO_LEVELS) {
        if (filterPros(withSubject, { level: lv }).length === 0) continue;
        add(`/professeurs/${c.slug}/${s.slug}/${lv.slug}`);
      }
    }
  }

  for (const p of pros) add(`/professeur/${proSlug(p)}`);

  for (const lang of LANGS) {
    const posts = await fetchPublishedPosts(lang).catch(() => []);
    for (const post of posts) paths.add(`/${lang}/blog/${post.slug}`);
  }

  return [...paths];
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = await buildUrls();
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
