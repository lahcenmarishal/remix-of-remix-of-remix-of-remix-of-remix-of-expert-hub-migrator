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
        {
          title: lang === "fr" ? `Recherches fréquentes à ${city.fr}` : `أكثر الطلبات ${city.arBi}`,
          items: localIntentLinks(lang, city),
        },
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
        ...(city ? [crumb(lang, "/$lang/villes/$ville", { ville: city.slug }, label.city(city, lang))] : []),
      ]}
      sections={sections}
    >
      {city ? (
        <section className="mt-8 max-w-3xl rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-bold">
            {lang === "fr"
              ? `Cours particuliers à ${city.fr} : comment ça marche`
              : `دروس خصوصية ${city.arIn}: كيف تسير الأمور`}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {lang === "fr"
              ? `Que vous cherchiez un professeur de maths à ${city.fr}, un cours de français à domicile ou du soutien scolaire en ligne, chaque profil affiche le tarif horaire, les niveaux enseignés et les quartiers desservis à ${city.fr}.`
              : `سواء كنت تبحث عن ${SEO_SUBJECTS[0]?.arTeacher ?? "أستاذ خصوصي"} ${city.arIn}، أو عن دروس الدعم في المنزل أو عن بعد، يعرض كل ملف السعر بالساعة والمستويات المدرَّسة والأحياء المغطاة ${city.arBi}.`}
          </p>
          <SeoLink
            to="/$lang/villes/$ville"
            params={{ lang, ville: city.slug }}
            className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
          >
            {lang === "fr"
              ? `Voir la page complète de ${city.fr} →`
              : `عرض الصفحة الكاملة ${city.arBi} ←`}
          </SeoLink>
        </section>
      ) : null}
    </SeoLandingPage>
  );
}
