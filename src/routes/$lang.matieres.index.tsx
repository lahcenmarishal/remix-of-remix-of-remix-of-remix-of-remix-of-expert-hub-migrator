import { createFileRoute } from "@tanstack/react-router";
import { LinkGrid, SeoShell } from "@/components/seo-landing";
import { nav, subjectHubCopy } from "@/lib/seo-copy";
import { homeCrumb, subjectLinks } from "@/lib/seo-links";
import { breadcrumbLd, seoHead, type SeoLang } from "@/lib/seo-taxonomy";

export const Route = createFileRoute("/$lang/matieres/")({
  head: ({ params }) => {
    const lang = params.lang as SeoLang;
    const c = subjectHubCopy(lang);
    return seoHead({
      lang,
      path: "/matieres",
      title: c.title,
      description: c.description,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("subjects", lang), path: "/matieres" },
      ]),
    });
  },
  component: SubjectsHub,
});

function SubjectsHub() {
  const lang = Route.useParams().lang as SeoLang;
  const c = subjectHubCopy(lang);
  return (
    <SeoShell lang={lang} breadcrumbs={[homeCrumb(lang)]}>
      <h1 className="text-3xl font-bold tracking-tight">{c.h1}</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">{c.intro}</p>
      <LinkGrid title={nav("subjects", lang)} items={subjectLinks(lang)} />
    </SeoShell>
  );
}
