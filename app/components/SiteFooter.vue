<template>
  <footer class="border-t py-3">
    <div
      class="mx-auto flex max-w-6xl flex-col-reverse items-center justify-between gap-2 px-5 sm:flex-row sm:px-8"
    >
      <span class="text-xs text-gray-500">
        &copy; {{ new Date().getFullYear() }} Peter Kim. All Right Reserved.
      </span>

      <div class="flex items-center gap-2.5 text-sm">
        <NuxtLink
          to="mailto:peterkimzz69@gmail.com"
          class="text-inherit no-underline hover:underline"
        >
          이메일 보내기
        </NuxtLink>
        <NuxtLink
          to="https://dub.sh/peter-30m"
          target="_blank"
          class="text-inherit no-underline hover:underline"
        >
          화상미팅 요청하기
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
