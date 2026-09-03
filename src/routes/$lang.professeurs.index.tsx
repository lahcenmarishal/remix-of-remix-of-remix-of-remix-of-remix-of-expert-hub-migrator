import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/seo-landing";
import { nav, teachersCopy } from "@/lib/seo-copy";
import { cityLinks, homeCrumb, levelLinks, subjectSegmentLinks } from "@/lib/seo-links";
import { breadcrumbLd, seoHead, type SeoLang } from "@/lib/seo-taxonomy";

export const Route = createFileRoute("/$lang/professeurs/")({
  head: ({ params }) => {
    const lang = params.lang as SeoLang;
    const c = teachersCopy(lang, null, null, null);
    return seoHead({
      lang,
      path: "/professeurs",
      title: c.title,
      description: c.description,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("teachers", lang), path: "/professeurs" },
      ]),
    });
  },
  component: TeachersHub,
});

function TeachersHub() {
  const lang = Route.useParams().lang as SeoLang;
  const c = teachersCopy(lang, null, null, null);
  return (
    <SeoLandingPage
      lang={lang}
      h1={c.h1}
      intro={c.intro}
      filter={{}}
      breadcrumbs={[homeCrumb(lang)]}
      sections={[
        { title: nav("cities", lang), items: cityLinks(lang, "/$lang/professeurs/$ville") },
        { title: nav("subjects", lang), items: subjectSegmentLinks(lang) },
        { title: nav("levels", lang), items: levelLinks(lang) },
      ]}
    />
  );
}
