<script setup lang="ts">
defineProps<{
  path: string
  title: string
  description?: string
  created?: string
  category?: string
}>()
</script>

<template>
  <li class="h-full">
    <NuxtLink
      :to="path"
      class="shell-panel group flex h-full flex-col rounded-[28px] p-5 no-underline transition hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(22,18,13,0.12)]"
    >
      <div class="mb-4 flex items-center justify-between gap-3">
        <span class="rounded-full bg-[var(--color-ink-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-700)]">
          {{ category || 'essay' }}
        </span>
        <ArticleDate :value="created" />
      </div>

      <h2 class="font-serif text-2xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-ink-900)] group-hover:text-[var(--color-accent-700)]">
        {{ title }}
      </h2>

      <p class="mt-4 line-clamp-4 text-sm leading-6 text-[var(--color-ink-700)]">
        {{ description || '설명이 없는 글입니다.' }}
      </p>
    </NuxtLink>
  </li>
</template>
