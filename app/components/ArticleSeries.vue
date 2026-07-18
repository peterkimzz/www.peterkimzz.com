<script setup lang="ts">
type SeriesArticle = {
  path: string;
  title?: string;
  series?: {
    name?: string;
    order?: number;
  };
};

const props = defineProps<{
  name: string;
  currentPath: string;
  articles: SeriesArticle[];
}>();

const orderedArticles = computed(() =>
  [...props.articles].sort((left, right) => {
    const orderDifference =
      (left.series?.order ?? Number.MAX_SAFE_INTEGER) -
      (right.series?.order ?? Number.MAX_SAFE_INTEGER);

    return orderDifference || left.path.localeCompare(right.path);
  }),
);

const currentIndex = computed(() =>
  orderedArticles.value.findIndex(
    (article) => article.path === props.currentPath,
  ),
);

const previousArticle = computed(() =>
  currentIndex.value > 0
    ? orderedArticles.value[currentIndex.value - 1]
    : undefined,
);

const nextArticle = computed(() =>
  currentIndex.value >= 0 &&
  currentIndex.value < orderedArticles.value.length - 1
    ? orderedArticles.value[currentIndex.value + 1]
    : undefined,
);
</script>

<template>
  <nav
    class="my-10 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5"
    :aria-label="`${props.name} 시리즈`"
  >
    <p class="text-sm font-semibold text-blue-600">시리즈</p>
    <h2 class="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950">
      {{ props.name }}
    </h2>

    <ol class="mt-4 space-y-2">
      <li v-for="(article, index) in orderedArticles" :key="article.path">
        <NuxtLink
          :to="article.path"
          class="flex gap-3 rounded-lg px-2 py-1.5 text-sm no-underline hover:bg-white hover:no-underline"
          :class="
            article.path === props.currentPath
              ? 'font-bold text-gray-950'
              : 'font-medium text-gray-600'
          "
          :aria-current="
            article.path === props.currentPath ? 'page' : undefined
          "
        >
          <span class="w-5 shrink-0 text-right text-gray-400">
            {{ article.series?.order ?? index + 1 }}
          </span>
          <span>{{ article.title || "Untitled" }}</span>
        </NuxtLink>
      </li>
    </ol>

    <div
      v-if="previousArticle || nextArticle"
      class="mt-5 grid gap-3 border-t border-gray-200 pt-4 sm:grid-cols-2"
    >
      <NuxtLink
        v-if="previousArticle"
        :to="previousArticle.path"
        class="rounded-lg px-2 py-1 text-sm font-semibold text-gray-700 no-underline hover:bg-white hover:no-underline"
      >
        ← {{ previousArticle.title || "이전 글" }}
      </NuxtLink>
      <span v-else />

      <NuxtLink
        v-if="nextArticle"
        :to="nextArticle.path"
        class="rounded-lg px-2 py-1 text-right text-sm font-semibold text-gray-700 no-underline hover:bg-white hover:no-underline"
      >
        {{ nextArticle.title || "다음 글" }} →
      </NuxtLink>
    </div>
  </nav>
</template>
