import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/seo-landing";
import { coursesCopy, nav } from "@/lib/seo-copy";
import { cityLinks, homeCrumb, subjectLinks } from "@/lib/seo-links";
import { breadcrumbLd, seoHead, type SeoLang } from "@/lib/seo-taxonomy";

export const Route = createFileRoute("/$lang/cours-particuliers/")({
  head: ({ params }) => {
    const lang = params.lang as SeoLang;
    const c = coursesCopy(lang, null, null);
    return seoHead({
      lang,
      path: "/cours-particuliers",
      title: c.title,
      description: c.description,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("courses", lang), path: "/cours-particuliers" },
      ]),
    });
  },
  component: CoursesHub,
});

function CoursesHub() {
  const lang = Route.useParams().lang as SeoLang;
  const c = coursesCopy(lang, null, null);
  return (
    <SeoLandingPage
      lang={lang}
      h1={c.h1}
      intro={c.intro}
      filter={{}}
      breadcrumbs={[homeCrumb(lang)]}
      sections={[
        { title: nav("cities", lang), items: cityLinks(lang, "/$lang/cours-particuliers/$ville") },
        { title: nav("subjects", lang), items: subjectLinks(lang) },
      ]}
    />
  );
}
