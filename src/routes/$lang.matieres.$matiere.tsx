import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/seo-landing";
import { label, nav, subjectCopy } from "@/lib/seo-copy";
import { citiesForSubject, homeCrumb } from "@/lib/seo-links";
import {
  SEO_LEVELS,
  breadcrumbLd,
  findSubject,
  seoHead,
  type SeoLang,
} from "@/lib/seo-taxonomy";

export const Route = createFileRoute("/$lang/matieres/$matiere")({
  beforeLoad: ({ params }) => {
    if (!findSubject(params.matiere)) throw notFound();
  },
  head: ({ params }) => {
    const lang = params.lang as SeoLang;
    const subject = findSubject(params.matiere)!;
    const c = subjectCopy(lang, subject);
    const path = `/matieres/${params.matiere}`;
    return seoHead({
      lang,
      path,
      title: c.title,
      description: c.description,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("subjects", lang), path: "/matieres" },
        { name: c.h1, path },
      ]),
    });
  },
  component: SubjectPage,
});

function SubjectPage() {
  const { lang: rawLang, matiere } = Route.useParams();
  const lang = rawLang as SeoLang;
  const subject = findSubject(matiere)!;
  const c = subjectCopy(lang, subject);
  return (
    <SeoLandingPage
      lang={lang}
      h1={c.h1}
      intro={c.intro}
      filter={{ subject }}
      breadcrumbs={[
        homeCrumb(lang),
        { to: "/$lang/matieres", params: { lang }, label: nav("subjects", lang) },
      ]}
      sections={[
        { title: nav("cities", lang), items: citiesForSubject(lang, subject.slug, subject.fr, subject.ar) },
        {
          title: nav("levels", lang),
          items: SEO_LEVELS.map((l) => ({
            to: "/$lang/niveaux/$niveau",
            params: { lang, niveau: l.slug },
            label: label.level(l, lang),
          })),
        },
      ]}
    />
  );
}
