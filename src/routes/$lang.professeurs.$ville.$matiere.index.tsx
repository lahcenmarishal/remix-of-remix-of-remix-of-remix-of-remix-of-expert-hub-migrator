import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/seo-landing";
import { label, nav, teachersCopy } from "@/lib/seo-copy";
import { homeCrumb } from "@/lib/seo-links";
import {
  SEO_LEVELS,
  breadcrumbLd,
  filterPros,
  findCity,
  findSubject,
  seoHead,
  type SeoLang,
} from "@/lib/seo-taxonomy";
import { fetchProfessionals } from "@/lib/marketplace";

export const Route = createFileRoute("/$lang/professeurs/$ville/$matiere/")({
  loader: async ({ params }) => {
    const city = findCity(params.ville);
    const subject = findSubject(params.matiere);
    if (!city || !subject) throw notFound();
    const pros = await fetchProfessionals().catch(() => []);
    return { count: filterPros(pros, { city, subject }).length };
  },
  head: ({ params, loaderData }) => {
    const lang = params.lang as SeoLang;
    const city = findCity(params.ville);
    const subject = findSubject(params.matiere);
    const c = teachersCopy(lang, city, subject, null);
    const path = `/professeurs/${params.ville}/${params.matiere}`;
    return seoHead({
      lang,
      path,
      title: c.title,
      description: c.description,
      // Indexée uniquement si la page a des données réelles (au moins un professeur).
      index: (loaderData?.count ?? 0) > 0,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("teachers", lang), path: "/professeurs" },
        { name: city ? label.city(city, lang) : "", path: `/professeurs/${params.ville}` },
        { name: c.h1, path },
      ]),
    });
  },
  component: CitySubject,
});

function CitySubject() {
  const { lang: rawLang, ville, matiere } = Route.useParams();
  const lang = rawLang as SeoLang;
  const city = findCity(ville);
  const subject = findSubject(matiere);
  const c = teachersCopy(lang, city, subject, null);

  return (
    <SeoLandingPage
      lang={lang}
      h1={c.h1}
      intro={c.intro}
      filter={{ city, subject }}
      breadcrumbs={[
        homeCrumb(lang),
        { to: "/$lang/professeurs", params: { lang }, label: nav("teachers", lang) },
        {
          to: "/$lang/professeurs/$ville",
          params: { lang, ville },
          label: city ? label.city(city, lang) : ville,
        },
      ]}
      sections={[
        {
          title: nav("levels", lang),
          items: SEO_LEVELS.map((l) => ({
            to: "/$lang/professeurs/$ville/$matiere/$niveau",
            params: { lang, ville, matiere, niveau: l.slug },
            label: label.level(l, lang),
          })),
        },
      ]}
    />
  );
}
