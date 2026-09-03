import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/seo-landing";
import { nav, teachersCopy } from "@/lib/seo-copy";
import { citiesForSubject, homeCrumb, levelLinks, subjectsInCity } from "@/lib/seo-links";
import {
  breadcrumbLd,
  findCity,
  findSubject,
  seoHead,
  type SeoLang,
} from "@/lib/seo-taxonomy";

/** /[lang]/professeurs/[ville] ou /[lang]/professeurs/[matiere]. */
function resolve(segment: string) {
  const city = findCity(segment);
  const subject = city ? null : findSubject(segment);
  return { city, subject };
}

export const Route = createFileRoute("/$lang/professeurs/$ville/")({
  beforeLoad: ({ params }) => {
    const { city, subject } = resolve(params.ville);
    if (!city && !subject) throw notFound();
  },
  head: ({ params }) => {
    const lang = params.lang as SeoLang;
    const { city, subject } = resolve(params.ville);
    const c = teachersCopy(lang, city, subject, null);
    return seoHead({
      lang,
      path: `/professeurs/${params.ville}`,
      title: c.title,
      description: c.description,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("teachers", lang), path: "/professeurs" },
        { name: c.h1, path: `/professeurs/${params.ville}` },
      ]),
    });
  },
  component: TeachersSegment,
});

function TeachersSegment() {
  const { lang: rawLang, ville } = Route.useParams();
  const lang = rawLang as SeoLang;
  const { city, subject } = resolve(ville);
  const c = teachersCopy(lang, city, subject, null);

  const sections = city
    ? [
        { title: nav("subjects", lang), items: subjectsInCity(lang, city) },
        { title: nav("levels", lang), items: levelLinks(lang) },
      ]
    : subject
      ? [{ title: nav("cities", lang), items: citiesForSubject(lang, subject.slug, subject.fr, subject.ar) }]
      : [];

  return (
    <SeoLandingPage
      lang={lang}
      h1={c.h1}
      intro={c.intro}
      filter={{ city, subject }}
      breadcrumbs={[
        homeCrumb(lang),
        { to: "/$lang/professeurs", params: { lang }, label: nav("teachers", lang) },
      ]}
      sections={sections}
    />
  );
}
