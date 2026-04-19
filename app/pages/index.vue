<script setup lang="ts">
import { excerptFromRaw } from '~/utils/content'

const { data: articles } = await useAsyncData('home-articles', () => {
  return queryCollection('content')
    .where('published', '=', true)
    .order('created', 'DESC')
    .select('path', 'title', 'description', 'created', 'category', 'rawbody')
    .all()
})

const cards = computed(() => {
  return (articles.value || []).map((article) => ({
    ...article,
    description: article.description || excerptFromRaw(article.rawbody),
  }))
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
    <section class="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-end">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-accent-700)]">
          Peter Kim's notebook
        </p>
        <h1 class="mt-4 max-w-4xl font-serif text-5xl font-bold leading-[0.96] tracking-[-0.05em] text-[var(--color-ink-900)] sm:text-7xl">
          기술과 일상, 그리고 만들면서 남긴 생각들.
        </h1>
      </div>

      <div class="shell-panel rounded-[32px] p-6">
        <p class="text-sm leading-7 text-[var(--color-ink-700)]">
          마크다운으로 쓰고 Git에 남기고 무료 인프라로 운영하는 개인 블로그입니다.
          이번 버전부터는 모바일에서도 초안을 저장하고 이미지를 바로 업로드할 수 있게 정리했습니다.
        </p>
      </div>
    </section>

    <section class="mt-14">
      <ul class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ArticleCard
          v-for="article in cards"
          :key="article.path"
          :path="article.path"
          :title="article.title || 'Untitled'"
          :description="article.description"
          :created="article.created"
          :category="article.category"
        />
      </ul>
    </section>
  </div>
</template>
