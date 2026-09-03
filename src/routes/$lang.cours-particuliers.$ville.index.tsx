import { createFileRoute, notFound } from "@tanstack/react-router";
import { SeoLandingPage } from "@/components/seo-landing";
import { coursesCopy, label, nav } from "@/lib/seo-copy";
import { homeCrumb } from "@/lib/seo-links";
import {
  SEO_SUBJECTS,
  breadcrumbLd,
  findCity,
  seoHead,
  type SeoLang,
} from "@/lib/seo-taxonomy";

export const Route = createFileRoute("/$lang/cours-particuliers/$ville/")({
  beforeLoad: ({ params }) => {
    if (!findCity(params.ville)) throw notFound();
  },
  head: ({ params }) => {
    const lang = params.lang as SeoLang;
    const city = findCity(params.ville);
    const c = coursesCopy(lang, city, null);
    const path = `/cours-particuliers/${params.ville}`;
    return seoHead({
      lang,
      path,
      title: c.title,
      description: c.description,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("courses", lang), path: "/cours-particuliers" },
        { name: c.h1, path },
      ]),
    });
  },
  component: CoursesCity,
});

function CoursesCity() {
  const { lang: rawLang, ville } = Route.useParams();
  const lang = rawLang as SeoLang;
  const city = findCity(ville);
  const c = coursesCopy(lang, city, null);
  return (
    <SeoLandingPage
      lang={lang}
      h1={c.h1}
      intro={c.intro}
      filter={{ city }}
      breadcrumbs={[
        homeCrumb(lang),
        { to: "/$lang/cours-particuliers", params: { lang }, label: nav("courses", lang) },
      ]}
      sections={[
        {
          title: nav("subjects", lang),
          items: SEO_SUBJECTS.map((s) => ({
            to: "/$lang/cours-particuliers/$ville/$matiere",
            params: { lang, ville, matiere: s.slug },
            label: label.subject(s, lang),
          })),
        },
        {
          title: nav("teachers", lang),
          items: [
            {
              to: "/$lang/professeurs/$ville",
              params: { lang, ville },
              label: city ? (lang === "fr" ? `Professeurs à ${city.fr}` : `أساتذة في ${city.ar}`) : ville,
            },
          ],
        },
      ]}
    />
  );
}
