import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useLanguage } from "@/lib/i18n";
import type { BlogLang } from "@/lib/blog";

/**
 * Garde la langue de l'URL du blog alignée avec la langue active du site.
 * Sur un article, bascule vers la traduction quand elle existe, sinon vers l'index.
 */
export function useBlogLangSync(
  current: BlogLang,
  options: { isArticle?: boolean; alternateSlug?: string | null } = {},
) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const { isArticle = false, alternateSlug = null } = options;

  useEffect(() => {
    if (lang === current) return;
    const target: BlogLang = lang === "ar" ? "ar" : "fr";
    if (isArticle && alternateSlug) {
      void navigate({
        to: target === "ar" ? "/ar/blog/$slug" : "/fr/blog/$slug",
        params: { slug: alternateSlug },
        replace: true,
      });
      return;
    }
    void navigate({ to: target === "ar" ? "/ar/blog" : "/fr/blog", replace: true });
  }, [lang, current, isArticle, alternateSlug, navigate]);
}
