<script setup lang="ts">
defineProps<{
  path: string;
  title: string;
  description?: string;
  created?: string;
  category?: string;
}>();
</script>

<template>
  <li>
    <NuxtLink
      :to="path"
      class="group flex flex-col no-underline hover:no-underline"
    >
      <header class="sm:h-[142px]">
        <h2
          class="pb-2 text-xl font-bold leading-tight tracking-[-0.01em] text-gray-900 group-hover:underline"
        >
          {{ title }}
        </h2>

        <p class="line-clamp-3 font-medium text-gray-600/90">
          {{ description || "설명이 없는 글입니다." }}
        </p>
      </header>

      <div class="flex flex-1 items-center justify-between gap-1.5 pt-1">
        <ArticleDate :value="created" />
      </div>
    </NuxtLink>
  </li>
</template>
