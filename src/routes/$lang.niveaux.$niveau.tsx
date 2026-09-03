import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/seo-landing";
import { label, levelCopy, nav } from "@/lib/seo-copy";
import { cityLinks, homeCrumb } from "@/lib/seo-links";
import { SEO_SUBJECTS, breadcrumbLd, findLevel, seoHead, type SeoLang } from "@/lib/seo-taxonomy";

export const Route = createFileRoute("/$lang/niveaux/$niveau")({
  beforeLoad: ({ params }) => {
    if (!findLevel(params.niveau)) throw notFound();
  },
  head: ({ params }) => {
    const lang = params.lang as SeoLang;
    const level = findLevel(params.niveau)!;
    const c = levelCopy(lang, level);
    const path = `/niveaux/${params.niveau}`;
    return seoHead({
      lang,
      path,
      title: c.title,
      description: c.description,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("levels", lang), path: "/niveaux" },
        { name: c.h1, path },
      ]),
    });
  },
  component: LevelPage,
});

function LevelPage() {
  const { lang: rawLang, niveau } = Route.useParams();
  const lang = rawLang as SeoLang;
  const level = findLevel(niveau)!;
  const c = levelCopy(lang, level);
  return (
    <SeoLandingPage
      lang={lang}
      h1={c.h1}
      intro={c.intro}
      filter={{ level }}
      breadcrumbs={[
        homeCrumb(lang),
        { to: "/$lang/niveaux", params: { lang }, label: nav("levels", lang) },
      ]}
      sections={[
        {
          title: nav("subjects", lang),
          items: SEO_SUBJECTS.map((s) => ({
            to: "/$lang/matieres/$matiere",
            params: { lang, matiere: s.slug },
            label: label.subject(s, lang),
          })),
        },
        { title: nav("cities", lang), items: cityLinks(lang) },
      ]}
    />
  );
}
