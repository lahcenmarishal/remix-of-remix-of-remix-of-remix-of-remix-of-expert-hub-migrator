import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/seo-landing";
import { cityCopy, label, nav } from "@/lib/seo-copy";
import { homeCrumb, subjectsInCity } from "@/lib/seo-links";
import { SEO_LEVELS, breadcrumbLd, findCity, seoHead, type SeoLang } from "@/lib/seo-taxonomy";

export const Route = createFileRoute("/$lang/villes/$ville")({
  beforeLoad: ({ params }) => {
    if (!findCity(params.ville)) throw notFound();
  },
  head: ({ params }) => {
    const lang = params.lang as SeoLang;
    const city = findCity(params.ville)!;
    const c = cityCopy(lang, city);
    const path = `/villes/${params.ville}`;
    return seoHead({
      lang,
      path,
      title: c.title,
      description: c.description,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("cities", lang), path: "/villes" },
        { name: c.h1, path },
      ]),
    });
  },
  component: CityPage,
});

function CityPage() {
  const { lang: rawLang, ville } = Route.useParams();
  const lang = rawLang as SeoLang;
  const city = findCity(ville)!;
  const c = cityCopy(lang, city);
  return (
    <SeoLandingPage
      lang={lang}
      h1={c.h1}
      intro={c.intro}
      filter={{ city }}
      breadcrumbs={[
        homeCrumb(lang),
        { to: "/$lang/villes", params: { lang }, label: nav("cities", lang) },
      ]}
      sections={[
        { title: nav("subjects", lang), items: subjectsInCity(lang, city) },
        {
          title: nav("levels", lang),
          items: SEO_LEVELS.map((l) => ({
            to: "/$lang/niveaux/$niveau",
            params: { lang, niveau: l.slug },
            label: label.level(l, lang),
          })),
        },
        {
          title: nav("courses", lang),
          items: [
            {
              to: "/$lang/cours-particuliers/$ville",
              params: { lang, ville },
              label:
                lang === "fr" ? `Cours particuliers à ${city.fr}` : `دروس خصوصية في ${city.ar}`,
            },
          ],
        },
      ]}
    />
  );
}
