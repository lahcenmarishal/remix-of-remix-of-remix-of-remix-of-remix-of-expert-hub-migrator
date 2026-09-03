import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SeoLink, SeoShell } from "@/components/seo-landing";
import { ProCard } from "@/components/pro-card";
import { RequestProButton } from "@/components/request-pro";
import { fetchProfessionals, cityName, serviceName } from "@/lib/marketplace";
import { nav } from "@/lib/seo-copy";
import { homeCrumb } from "@/lib/seo-links";
import { SITE_URL } from "@/lib/blog";
import {
  SEO_CITIES,
  SEO_SUBJECTS,
  breadcrumbLd,
  findProBySlug,
  seoHead,
  serviceMatchesSubject,
  type SeoLang,
} from "@/lib/seo-taxonomy";
import { withBrand } from "@/lib/seo-copy";

export const Route = createFileRoute("/$lang/professeur/$slug")({
  loader: async ({ params }) => {
    const pros = await fetchProfessionals().catch(() => []);
    const pro = findProBySlug(pros, params.slug);
    if (!pro) throw notFound();
    return {
      id: pro.id,
      name: pro.display_name,
      headline: pro.headline,
      city: cityName(pro.city_id),
      rate: pro.hourly_rate,
      rating: pro.rating_avg,
      ratingCount: pro.rating_count,
      subjectSlug:
        SEO_SUBJECTS.find((sub) => pro.professional_services.some((s) => serviceMatchesSubject(s.service_id, sub)))
          ?.slug ?? null,
      citySlug: SEO_CITIES.find((c) => c.cityName === cityName(pro.city_id))?.slug ?? null,
      subjects: Array.from(
        new Set(pro.professional_services.map((s) => serviceName(s.service_id)).filter(Boolean)),
      ) as string[],
    };
  },
  head: ({ params, loaderData }) => {
    const lang = params.lang as SeoLang;
    const path = `/professeur/${params.slug}`;
    if (!loaderData) {
      return seoHead({
        lang,
        path,
        title: lang === "fr" ? "Professeur introuvable | Profinder" : "الأستاذ غير موجود | Profinder",
        description: lang === "fr" ? "Ce profil n'est plus disponible." : "هذا الملف لم يعد متاحاً.",
        index: false,
      });
    }
    const subjects = loaderData.subjects.slice(0, 4).join(", ");
    const seoSubject = SEO_SUBJECTS.find((s) => s.slug === loaderData.subjectSlug) ?? null;
    const seoCity = SEO_CITIES.find((c) => c.slug === loaderData.citySlug) ?? null;
    // « Professeur de mathématiques à Agadir — Nom » / « أستاذ الرياضيات في أكادير — الاسم »
    const lead =
      lang === "fr"
        ? `${seoSubject ? `Professeur de ${seoSubject.fr.toLowerCase()}` : "Professeur particulier"}${
            loaderData.city ? ` à ${loaderData.city}` : ""
          } — ${loaderData.name}`
        : `${seoSubject ? seoSubject.arTeacher : "أستاذ خصوصي"}${
            seoCity ? ` ${seoCity.arIn}` : ""
          } — ${loaderData.name}`;
    const description =
      lang === "fr"
        ? `${loaderData.name} enseigne ${subjects || "plusieurs matières"}${loaderData.city ? ` à ${loaderData.city}` : ""}. Tarif ${loaderData.rate} DH/h, profil vérifié, avis d'élèves.`
        : `${loaderData.name} يدرّس ${subjects || "عدة مواد"}${loaderData.city ? ` في ${loaderData.city}` : ""}. السعر ${loaderData.rate} درهم/ساعة، ملف موثوق وآراء التلاميذ.`;
    return seoHead({
      lang,
      path,
      title: withBrand(lead),
      description,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Person",
          name: loaderData.name,
          jobTitle: lang === "fr" ? "Professeur particulier" : "أستاذ خصوصي",
          url: `${SITE_URL}/${lang}${path}`,
          ...(loaderData.city ? { address: { "@type": "PostalAddress", addressLocality: loaderData.city } } : {}),
          knowsAbout: loaderData.subjects,
        },
        breadcrumbLd(lang, [
          { name: nav("home", lang), path: "" },
          { name: nav("teachers", lang), path: "/professeurs" },
          { name: loaderData.name, path },
        ]),
      ],
    });
  },
  component: TeacherProfile,
});

function TeacherProfile() {
  const { lang: rawLang } = Route.useParams();
  const lang = rawLang as SeoLang;
  const data = Route.useLoaderData();
  const pros = useQuery({ queryKey: ["professionals"], queryFn: fetchProfessionals });
  const pro = (pros.data ?? []).find((p) => p.id === data.id) ?? null;

  return (
    <SeoShell
      lang={lang}
      breadcrumbs={[
        homeCrumb(lang),
        { to: "/$lang/professeurs", params: { lang }, label: nav("teachers", lang) },
      ]}
    >
      <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
      {data.headline ? <p className="mt-2 text-muted-foreground">{data.headline}</p> : null}
      <p className="mt-2 text-sm text-muted-foreground">
        {[data.city, `${data.rate} DH/h`, data.subjects.slice(0, 5).join(" · ")]
          .filter(Boolean)
          .join(" — ")}
      </p>

      <div className="mt-8 max-w-md">
        {pro ? <ProCard pro={pro} action={<RequestProButton pro={pro} />} /> : null}
      </div>

      <div className="mt-8">
        <SeoLink
          to="/professeurs/$id"
          params={{ id: data.id }}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {lang === "fr" ? "Voir le profil détaillé et les avis" : "عرض الملف التفصيلي والآراء"}
        </SeoLink>
      </div>
    </SeoShell>
  );
}
