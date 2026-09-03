import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { MobileTabBar, SiteFooter, SiteHeader } from "@/components/site";
import { ProCard } from "@/components/pro-card";
import { fetchProfessionals } from "@/lib/marketplace";
import { filterPros, proSlug, type SeoFilter, type SeoLang } from "@/lib/seo-taxonomy";

export type SeoLinkItem = { to: string; params?: Record<string, string>; label: string };

/** Lien interne typé de façon souple (les chemins sont construits dynamiquement). */
export function SeoLink({
  to,
  params,
  className,
  children,
}: {
  to: string;
  params?: Record<string, string> | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link to={to as never} params={params as never} className={className}>
      {children}
    </Link>
  );
}

export function SeoShell({
  lang,
  breadcrumbs,
  children,
}: {
  lang: SeoLang;
  breadcrumbs?: SeoLinkItem[];
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-background font-sans text-foreground"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Fil d'Ariane" className="mb-6 text-xs text-muted-foreground">
            {breadcrumbs.map((b, i) => (
              <span key={b.to + (b.params ? JSON.stringify(b.params) : "")}>
                {i > 0 ? <span className="px-1.5">/</span> : null}
                <SeoLink to={b.to} params={b.params} className="hover:text-primary">
                  {b.label}
                </SeoLink>
              </span>
            ))}
          </nav>
        ) : null}
        {children}
      </main>
      <MobileTabBar />
      <SiteFooter />
    </div>
  );
}

export function LinkGrid({ title, items }: { title: string; items: SeoLinkItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <SeoLink
            key={it.label + it.to + JSON.stringify(it.params ?? {})}
            to={it.to}
            params={it.params}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition hover:border-primary hover:text-primary"
          >
            {it.label}
          </SeoLink>
        ))}
      </div>
    </section>
  );
}

/** Page de destination : H1, contenu éditorial, professeurs réels, maillage interne. */
export function SeoLandingPage({
  lang,
  h1,
  intro,
  filter,
  breadcrumbs,
  sections,
  faq,
  children,
}: {
  lang: SeoLang;
  h1: string;
  intro: string;
  filter: SeoFilter;
  breadcrumbs?: SeoLinkItem[];
  sections?: Array<{ title: string; items: SeoLinkItem[] }>;
  faq?: Array<{ q: string; a: string }>;
  children?: ReactNode;
}) {
  const pros = useQuery({ queryKey: ["professionals"], queryFn: fetchProfessionals });
  const matches = filterPros(pros.data ?? [], filter);

  const cta = lang === "fr" ? "Publier ma demande gratuitement" : "انشر طلبك مجاناً";
  const emptyText =
    lang === "fr"
      ? "Aucun professeur n'est encore référencé ici. Publiez votre demande : les professeurs disponibles y répondront sous 24 h."
      : "لا يوجد أستاذ مسجل هنا بعد. انشر طلبك وسيتجاوب معك الأساتذة المتاحون خلال 24 ساعة.";

  return (
    <SeoShell lang={lang} breadcrumbs={breadcrumbs}>
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">{h1}</h1>
        <p className="mt-3 text-muted-foreground">{intro}</p>
        <SeoLink
          to="/publier"
          className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          {cta}
        </SeoLink>
      </header>

      {children}

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-bold">
          {lang === "fr"
            ? `${matches.length} professeur${matches.length > 1 ? "s" : ""} disponible${matches.length > 1 ? "s" : ""}`
            : `${matches.length} أستاذ متاح`}
        </h2>
        {pros.isLoading ? (
          <p className="text-sm text-muted-foreground">…</p>
        ) : matches.length === 0 ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {matches.slice(0, 24).map((p) => (
              <div key={p.id}>
                <ProCard pro={p} />
                <SeoLink
                  to="/$lang/professeur/$slug"
                  params={{ lang, slug: proSlug(p) }}
                  className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                >
                  {lang === "fr" ? "Voir la fiche complète" : "عرض الملف الكامل"}
                </SeoLink>
              </div>
            ))}
          </div>
        )}
      </section>

      {(sections ?? []).map((s) => (
        <LinkGrid key={s.title} title={s.title} items={s.items} />
      ))}

      {faq && faq.length > 0 ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-4 text-lg font-bold">{lang === "fr" ? "Questions fréquentes" : "أسئلة شائعة"}</h2>
          <div className="space-y-4">
            {faq.map((f) => (
              <div key={f.q} className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold">{f.q}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </SeoShell>
  );
}
