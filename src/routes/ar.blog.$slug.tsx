import { createFileRoute } from "@tanstack/react-router";
import { BlogArticleView } from "@/components/blog-views";
import { blogArticleHead } from "@/lib/blog-seo";
import { fetchAlternateSlug, fetchPostBySlug, fetchPublishedPosts } from "@/lib/blog";
import { useBlogLangSync } from "@/lib/blog-lang";

export const Route = createFileRoute("/ar/blog/$slug")({
  loader: async ({ params }) => {
    const [post, all] = await Promise.all([
      fetchPostBySlug("ar", params.slug),
      fetchPublishedPosts("ar"),
    ]);
    const alternateSlug = await fetchAlternateSlug(post?.translation_key ?? null, "fr");
    return { post, alternateSlug, related: all.filter((p) => p.slug !== params.slug).slice(0, 3) };
  },
  head: ({ params, loaderData }) =>
    blogArticleHead("ar", params.slug, loaderData?.post ?? null, loaderData?.alternateSlug ?? null),
  component: BlogPostPageAr,
});

function BlogPostPageAr() {
  const { post, related, alternateSlug } = Route.useLoaderData();
  useBlogLangSync("ar", { isArticle: true, alternateSlug });
  return <BlogArticleView lang="ar" post={post} related={related} />;
}
