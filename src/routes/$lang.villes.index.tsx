import { createFileRoute } from "@tanstack/react-router";
import { LinkGrid, SeoShell } from "@/components/seo-landing";
import { cityHubCopy, nav } from "@/lib/seo-copy";
import { cityLinks, homeCrumb } from "@/lib/seo-links";
import { breadcrumbLd, seoHead, type SeoLang } from "@/lib/seo-taxonomy";

export const Route = createFileRoute("/$lang/villes/")({
  head: ({ params }) => {
    const lang = params.lang as SeoLang;
    const c = cityHubCopy(lang);
    return seoHead({
      lang,
      path: "/villes",
      title: c.title,
      description: c.description,
      jsonLd: breadcrumbLd(lang, [
        { name: nav("home", lang), path: "" },
        { name: nav("cities", lang), path: "/villes" },
      ]),
    });
  },
  component: CitiesHub,
});

function CitiesHub() {
  const lang = Route.useParams().lang as SeoLang;
  const c = cityHubCopy(lang);
  return (
    <SeoShell lang={lang} breadcrumbs={[homeCrumb(lang)]}>
      <h1 className="text-3xl font-bold tracking-tight">{c.h1}</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">{c.intro}</p>
      <LinkGrid title={nav("cities", lang)} items={cityLinks(lang)} />
    </SeoShell>
  );
}
