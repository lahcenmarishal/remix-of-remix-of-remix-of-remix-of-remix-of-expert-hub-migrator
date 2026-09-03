import { createFileRoute } from "@tanstack/react-router";
import { BlogArticleView } from "@/components/blog-views";
import { blogArticleHead } from "@/lib/blog-seo";
import { fetchAlternateSlug, fetchPostBySlug, fetchPublishedPosts } from "@/lib/blog";

export const Route = createFileRoute("/fr/blog/$slug")({
  loader: async ({ params }) => {
    const [post, all] = await Promise.all([
      fetchPostBySlug("fr", params.slug),
      fetchPublishedPosts("fr"),
    ]);
    const alternateSlug = await fetchAlternateSlug(post?.translation_key ?? null, "ar");
    return { post, alternateSlug, related: all.filter((p) => p.slug !== params.slug).slice(0, 3) };
  },
  head: ({ params, loaderData }) =>
    blogArticleHead("fr", params.slug, loaderData?.post ?? null, loaderData?.alternateSlug ?? null),
  component: BlogPostPageFr,
});

function BlogPostPageFr() {
  const { post, related } = Route.useLoaderData();
  return <BlogArticleView lang="fr" post={post} related={related} />;
}
