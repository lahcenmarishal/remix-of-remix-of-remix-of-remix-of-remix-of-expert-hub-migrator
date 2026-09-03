import { createFileRoute } from "@tanstack/react-router";
import { LinkGrid, SeoLink, SeoShell } from "@/components/seo-landing";
import { homeCopy, nav } from "@/lib/seo-copy";
import { cityLinks, levelLinks, subjectLinks } from "@/lib/seo-links";
import { breadcrumbLd, seoHead, type SeoLang } from "@/lib/seo-taxonomy";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const lang = params.lang as SeoLang;
    const c = homeCopy(lang);
    return seoHead({
      lang,
      path: "",
      title: c.title,
      description: c.description,
      jsonLd: breadcrumbLd(lang, [{ name: c.h1, path: "" }]),
    });
  },
  component: LangHome,
});

function LangHome() {
  const lang = Route.useParams().lang as SeoLang;
  const c = homeCopy(lang);
  return (
    <SeoShell lang={lang}>
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">{c.h1}</h1>
        <p className="mt-3 text-muted-foreground">{c.intro}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <SeoLink
            to="/publier"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            {lang === "fr" ? "Publier ma demande" : "انشر طلبك"}
          </SeoLink>
          <SeoLink
            to="/$lang/professeurs"
            params={{ lang }}
            className="rounded-xl border border-border px-6 py-3 text-sm font-bold"
          >
            {nav("teachers", lang)}
          </SeoLink>
        </div>
      </header>

      <LinkGrid title={nav("subjects", lang)} items={subjectLinks(lang)} />
      <LinkGrid title={nav("cities", lang)} items={cityLinks(lang)} />
      <LinkGrid title={nav("levels", lang)} items={levelLinks(lang)} />
      <LinkGrid
        title={nav("blog", lang)}
        items={[{ to: lang === "fr" ? "/fr/blog" : "/ar/blog", label: nav("blog", lang) }]}
      />
    </SeoShell>
  );
}
