import { queryCollection } from "@nuxt/content/server";

export default defineSitemapEventHandler(async (event) => {
  const posts = await queryCollection(event, "content")
    .select("path", "updated", "tags")
    .all();

  const postUrls = posts.map((post) => ({
    loc: post.path,
    lastmod: post.updated || undefined,
  }));

  const tags = new Set(
    posts.flatMap((post) =>
      (post.tags || []).map((tag) => tag.trim()).filter(Boolean),
    ),
  );
  const tagUrls = [...tags].map((tag) => ({
    loc: `/tags/${encodeURIComponent(tag)}`,
  }));

  return [...postUrls, ...tagUrls];
});
