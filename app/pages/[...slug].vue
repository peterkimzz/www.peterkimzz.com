<script setup lang="ts">
import { excerptFromRaw, normalizeContentPath } from '~/utils/content'

const route = useRoute()
const articlePath = normalizeContentPath(route.path)

useZoomableImages()

const { data: article } = await useAsyncData(`article:${articlePath}`, () => {
  return queryCollection('content')
    .path(articlePath)
    .first()
})

if (!article.value || !article.value.published) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  })
}

const { data: related } = await useAsyncData(`related:${articlePath}`, () => {
  return queryCollection('content')
    .where('published', '=', true)
    .where('category', '=', article.value?.category || '')
    .where('path', '<>', articlePath)
    .order('created', 'DESC')
    .select('path', 'title', 'description', 'created', 'category', 'rawbody')
    .all()
})

useSeoMeta({
  title: article.value.title,
  description: article.value.description || excerptFromRaw(article.value.rawbody),
  ogTitle: article.value.title,
  ogDescription: article.value.description || excerptFromRaw(article.value.rawbody),
  ogImage: article.value.image,
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article class="shell-panel rounded-[36px] px-5 py-8 sm:px-8 sm:py-10">
        <div class="mx-auto max-w-3xl">
          <NuxtLink
            to="/"
            class="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-700)] hover:text-[var(--color-accent-600)]"
          >
            Back to archive
          </NuxtLink>

          <header class="mt-6 border-b border-black/5 pb-8">
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-700)]">
              {{ article.category || 'essay' }}
            </p>
            <h1 class="mt-3 font-serif text-4xl font-bold leading-tight tracking-[-0.04em] text-[var(--color-ink-900)] sm:text-6xl">
              {{ article.title }}
            </h1>
            <p v-if="article.description" class="mt-4 max-w-2xl text-base leading-7 text-[var(--color-ink-700)]">
              {{ article.description }}
            </p>
            <div class="mt-6">
              <ArticleDate :value="article.created" />
            </div>
          </header>

          <ContentRenderer
            :value="article"
            class="article-prose prose prose-lg mt-10 max-w-none prose-a:text-[var(--color-accent-700)] prose-a:no-underline hover:prose-a:text-[var(--color-accent-600)] prose-blockquote:border-l-[3px] prose-blockquote:border-[var(--color-accent-500)] prose-blockquote:text-[var(--color-ink-700)] prose-strong:text-[var(--color-ink-900)]"
          />

          <ArticleComment />
        </div>
      </article>

      <aside class="space-y-5 lg:sticky lg:top-24 lg:h-fit">
        <section v-if="article.body?.toc?.links?.length" class="shell-panel rounded-[28px] p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-700)]">
            Table of contents
          </p>
          <ul class="mt-4 space-y-3">
            <li v-for="link in article.body.toc.links" :key="link.id">
              <NuxtLink :to="`#${link.id}`" class="text-sm leading-6 text-[var(--color-ink-700)] hover:text-[var(--color-ink-900)]">
                {{ link.text }}
              </NuxtLink>
            </li>
          </ul>
        </section>

        <section class="shell-panel rounded-[28px] p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-700)]">
            More in {{ article.category || 'this section' }}
          </p>
          <ul class="mt-4 space-y-4">
            <li v-for="item in related?.slice(0, 4)" :key="item.path">
              <NuxtLink :to="item.path" class="block hover:no-underline">
                <p class="font-serif text-lg font-semibold tracking-[-0.02em] text-[var(--color-ink-900)]">
                  {{ item.title }}
                </p>
                <p class="mt-1 text-sm leading-6 text-[var(--color-ink-700)]">
                  {{ item.description || excerptFromRaw(item.rawbody, 68) }}
                </p>
              </NuxtLink>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>
