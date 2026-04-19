<template>
  <header class="sticky top-0 z-50 border-b border-black/5 bg-[rgb(252_251_248_/_0.84)] backdrop-blur-xl">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
      <NuxtLink to="/" class="group inline-flex items-end gap-2">
        <span class="font-serif text-2xl font-bold tracking-[-0.04em] text-[var(--color-ink-900)]">
          PETERKIM
        </span>
        <span class="pb-0.5 text-sm font-semibold tracking-[0.28em] text-[var(--color-accent-600)] transition group-hover:translate-x-0.5">
          ZZ
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-4 text-sm font-semibold text-[var(--color-ink-700)] sm:gap-6">
        <NuxtLink to="https://resume.peterkimzz.com" target="_blank" class="hover:text-[var(--color-ink-900)]">
          Resume
        </NuxtLink>
        <NuxtLink to="https://github.com/peterkimzz" target="_blank" class="hover:text-[var(--color-ink-900)]">
          GitHub
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
