import { createFileRoute } from "@tanstack/react-router";
import { BlogIndexView } from "@/components/blog-views";
import { blogIndexHead } from "@/lib/blog-seo";
import { fetchPublishedPosts } from "@/lib/blog";
import { useBlogLangSync } from "@/lib/blog-lang";

export const Route = createFileRoute("/ar/blog/")({
  loader: () => fetchPublishedPosts("ar"),
  head: () => blogIndexHead("ar"),
  component: BlogIndexAr,
});

function BlogIndexAr() {
  useBlogLangSync("ar");
  return <BlogIndexView lang="ar" posts={Route.useLoaderData()} />;
}
