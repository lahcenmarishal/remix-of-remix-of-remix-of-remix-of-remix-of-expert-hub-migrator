import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/seo-landing";
import { label, nav, teachersCopy } from "@/lib/seo-copy";
import { homeCrumb } from "@/lib/seo-links";
import {
  breadcrumbLd,
  filterPros,
  findCity,
  findLevel,
  findSubject,
  seoHead,
  type SeoLang,
} from "@/lib/seo-taxonomy";
import { fetchProfessionals } from "@/lib/marketplace";

export const Route = createFileRoute("/$lang/professeurs/$ville/$matiere/$niveau")({
  loader: async ({ params }) => {
    const city = findCity(params.ville);
    const subject = findSubject(params.matiere);
    const level = findLevel(params.niveau);
    if (!city || !subject || !level) throw notFound();
    const pros = await fetchProfessionals().catch(() => []);
    return { count: filterPros(pros, { city, subject, level }).length };
  },
  head: ({ params, loaderData }) => {
    const lang = params.lang as SeoLang;
    const city = findCity(params.ville);
    const subject = findSubject(params.matiere);
    const level = findLevel(params.niveau);
    const c = teachersCopy(lang, city, subject, level);
    const path = `/professeurs/${params.ville}/${params.matiere}/${params.niveau}`;
    return seoHead({
      lang,
      path,
      title: c.title,
      description: c.description,
      index: (loaderData?.count ?? 0) > 0,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("teachers", lang), path: "/professeurs" },
        { name: city ? label.city(city, lang) : "", path: `/professeurs/${params.ville}` },
        {
          name: subject ? label.subject(subject, lang) : "",
          path: `/professeurs/${params.ville}/${params.matiere}`,
        },
        { name: c.h1, path },
      ]),
    });
  },
  component: CitySubjectLevel,
});

function CitySubjectLevel() {
  const { lang: rawLang, ville, matiere, niveau } = Route.useParams();
  const lang = rawLang as SeoLang;
  const city = findCity(ville);
  const subject = findSubject(matiere);
  const level = findLevel(niveau);
  const c = teachersCopy(lang, city, subject, level);

  return (
    <SeoLandingPage
      lang={lang}
      h1={c.h1}
      intro={c.intro}
      filter={{ city, subject, level }}
      breadcrumbs={[
        homeCrumb(lang),
        { to: "/$lang/professeurs", params: { lang }, label: nav("teachers", lang) },
        {
          to: "/$lang/professeurs/$ville",
          params: { lang, ville },
          label: city ? label.city(city, lang) : ville,
        },
        {
          to: "/$lang/professeurs/$ville/$matiere",
          params: { lang, ville, matiere },
          label: subject ? label.subject(subject, lang) : matiere,
        },
      ]}
    />
  );
}
