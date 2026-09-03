import { BLOG_COPY, SITE_URL, type BlogLang, type BlogPost } from "@/lib/blog";

export const other = (lang: BlogLang): BlogLang => (lang === "fr" ? "ar" : "fr");

export function blogIndexHead(lang: BlogLang) {
  const c = BLOG_COPY[lang];
  const url = `${SITE_URL}/${lang}/blog`;
  return {
    meta: [
      { title: c.indexTitle },
      { name: "description", content: c.indexDescription },
      { property: "og:title", content: c.indexTitle },
      { property: "og:description", content: c.indexDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:locale", content: lang === "fr" ? "fr_MA" : "ar_MA" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "fr", href: `${SITE_URL}/fr/blog` },
      { rel: "alternate", hrefLang: "ar", href: `${SITE_URL}/ar/blog` },
      { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}/fr/blog` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: c.blogName,
          url,
          inLanguage: lang,
          description: c.indexDescription,
        }),
      },
    ],
  };
}

export function blogArticleHead(
  lang: BlogLang,
  slug: string,
  post: BlogPost | null,
  alternateSlug: string | null,
) {
  const c = BLOG_COPY[lang];
  const url = `${SITE_URL}/${lang}/blog/${slug}`;
  if (!post) {
    return {
      meta: [{ title: `${c.notFound} — ProFinder` }, { name: "robots", content: "noindex" }],
    };
  }
  const image = post.cover_image ? `${SITE_URL}${post.cover_image}` : null;
  const alternates = [
    { rel: "alternate", hrefLang: lang, href: url },
    ...(alternateSlug
      ? [
          {
            rel: "alternate",
            hrefLang: other(lang),
            href: `${SITE_URL}/${other(lang)}/blog/${alternateSlug}`,
          },
          {
            rel: "alternate",
            hrefLang: "x-default",
            href:
              lang === "fr" ? url : `${SITE_URL}/fr/blog/${alternateSlug}`,
          },
        ]
      : []),
  ];
  return {
    meta: [
      { title: `${post.title} — ProFinder` },
      { name: "description", content: post.meta_description },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.meta_description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "og:locale", content: lang === "fr" ? "fr_MA" : "ar_MA" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(image
        ? [
            { property: "og:image", content: image },
            { name: "twitter:image", content: image },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: url }, ...alternates],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.meta_description,
          datePublished: post.published_at,
          inLanguage: lang,
          mainEntityOfPage: url,
          ...(image ? { image: [image] } : {}),
          author: { "@type": "Organization", name: "ProFinder" },
          publisher: { "@type": "Organization", name: "ProFinder" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: c.home, item: SITE_URL },
            { "@type": "ListItem", position: 2, name: c.kicker, item: `${SITE_URL}/${lang}/blog` },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
          ],
        }),
      },
    ],
  };
}
