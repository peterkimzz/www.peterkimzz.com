<script setup lang="ts">
const error = useError()
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
    <p class="text-base font-semibold text-blue-600">
      {{ error?.statusCode || 500 }}
    </p>
    <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
      페이지를 찾을 수 없습니다.
    </h1>
    <p class="mt-4 max-w-xl text-base leading-7 text-gray-600">
      요청하신 페이지가 없거나 아직 배포되지 않았습니다. 홈으로 돌아가 최신 글을 둘러보세요.
    </p>
    <NuxtLink
      to="/"
      class="mt-8 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm hover:bg-blue-500 hover:no-underline"
    >
      홈으로 돌아가기
    </NuxtLink>
  </div>
</template>
