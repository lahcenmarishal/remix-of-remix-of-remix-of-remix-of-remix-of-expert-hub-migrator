import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/seo-landing";
import { coursesCopy, label, nav } from "@/lib/seo-copy";
import { homeCrumb } from "@/lib/seo-links";
import {
  breadcrumbLd,
  filterPros,
  findCity,
  findSubject,
  seoHead,
  type SeoLang,
} from "@/lib/seo-taxonomy";
import { fetchProfessionals } from "@/lib/marketplace";

export const Route = createFileRoute("/$lang/cours-particuliers/$ville/$matiere")({
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
    const c = coursesCopy(lang, city, subject);
    const path = `/cours-particuliers/${params.ville}/${params.matiere}`;
    return seoHead({
      lang,
      path,
      title: c.title,
      description: c.description,
      index: (loaderData?.count ?? 0) > 0,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("courses", lang), path: "/cours-particuliers" },
        { name: city ? label.city(city, lang) : "", path: `/cours-particuliers/${params.ville}` },
        { name: c.h1, path },
      ]),
    });
  },
  component: CoursesCitySubject,
});

function CoursesCitySubject() {
  const { lang: rawLang, ville, matiere } = Route.useParams();
  const lang = rawLang as SeoLang;
  const city = findCity(ville);
  const subject = findSubject(matiere);
  const c = coursesCopy(lang, city, subject);
  return (
    <SeoLandingPage
      lang={lang}
      h1={c.h1}
      intro={c.intro}
      filter={{ city, subject }}
      breadcrumbs={[
        homeCrumb(lang),
        { to: "/$lang/cours-particuliers", params: { lang }, label: nav("courses", lang) },
        {
          to: "/$lang/cours-particuliers/$ville",
          params: { lang, ville },
          label: city ? label.city(city, lang) : ville,
        },
      ]}
      sections={[
        {
          title: nav("teachers", lang),
          items: [
            {
              to: "/$lang/professeurs/$ville/$matiere",
              params: { lang, ville, matiere },
              label:
                city && subject
                  ? lang === "fr"
                    ? `Professeurs de ${subject.fr} à ${city.fr}`
                    : `أساتذة ${subject.ar} في ${city.ar}`
                  : nav("teachers", lang),
            },
          ],
        },
      ]}
    />
  );
}
