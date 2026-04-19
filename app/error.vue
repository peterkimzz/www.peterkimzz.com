<script setup lang="ts">
const error = useError()
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
    <p class="rounded-full bg-[var(--color-ink-50)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-700)]">
      {{ error?.statusCode || 500 }}
    </p>
    <h1 class="mt-6 font-serif text-5xl font-bold tracking-[-0.05em] text-[var(--color-ink-900)]">
      페이지를 찾을 수 없습니다.
    </h1>
    <p class="mt-4 max-w-xl text-base leading-7 text-[var(--color-ink-700)]">
      요청하신 페이지가 없거나 아직 배포되지 않았습니다. 홈으로 돌아가 최신 글을 둘러보세요.
    </p>
    <NuxtLink
      to="/"
      class="mt-8 rounded-full bg-[var(--color-ink-900)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-700)]"
    >
      홈으로 돌아가기
    </NuxtLink>
  </div>
</template>
