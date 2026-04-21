<template>
  <header class="sticky top-0 z-50 border-b bg-white">
    <div
      class="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8"
    >
      <NuxtLink
        to="/"
        class="text-xl font-bold italic tracking-wide text-gray-900 no-underline hover:no-underline"
      >
        <span> PETERKIM </span>
        <span class="text-gray-500"> ZZ </span>
      </NuxtLink>

      <nav class="flex items-center gap-5 text-sm font-semibold text-gray-900">
        <NuxtLink
          to="https://resume.peterkimzz.com"
          target="_blank"
          class="block py-3 text-inherit no-underline hover:underline"
        >
          Résumé
        </NuxtLink>
        <NuxtLink
          to="https://github.com/peterkimzz"
          target="_blank"
          class="block py-3 text-inherit no-underline hover:underline"
        >
          GitHub
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
