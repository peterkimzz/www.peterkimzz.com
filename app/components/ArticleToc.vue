<script setup lang="ts">
type TocLink = {
  id: string;
  text: string;
  depth?: number;
  children?: TocLink[];
};

const props = defineProps<{
  links: TocLink[];
}>();

const { isActive, isAncestorActive } = useScrollSpy(() => props.links);
</script>

<template>
  <section
    v-if="links.length"
    class="sticky top-24 border-l border-gray-200 pl-6"
  >
    <h4
      class="pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400"
    >
      목차
    </h4>
    <ul class="space-y-3">
      <li v-for="link in links" :key="link.id" class="space-y-2">
        <NuxtLink
          :to="`#${link.id}`"
          :aria-current="isActive(link.id) ? 'location' : undefined"
          class="block text-sm leading-6 no-underline font-medium transition-colors duration-200 hover:underline"
          :class="
            isActive(link.id)
              ? 'text-gray-950'
              : isAncestorActive(link.id)
                ? 'text-gray-700'
                : 'text-gray-400 hover:text-gray-600'
          "
        >
          {{ link.text }}
        </NuxtLink>

        <ul
          v-if="link.children?.length"
          class="space-y-1.5 border-l border-gray-100 pl-3"
        >
          <li v-for="child in link.children" :key="child.id">
            <NuxtLink
              :to="`#${child.id}`"
              :aria-current="isActive(child.id) ? 'location' : undefined"
              class="block text-sm leading-6 no-underline font-medium transition-colors duration-200 hover:underline"
              :class="
                isActive(child.id)
                  ? 'text-gray-950'
                  : isAncestorActive(child.id)
                    ? 'text-gray-700'
                    : 'text-gray-400 hover:text-gray-600'
              "
            >
              {{ child.text }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>
