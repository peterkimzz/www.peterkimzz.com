<script setup lang="ts">
const props = defineProps<{
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}>();
</script>

<template>
  <NuxtImg
    :src="props.src"
    :alt="props.alt || ''"
    :width="props.width"
    :height="props.height"
    loading="lazy"
    class="mx-auto my-8 w-full rounded-3xl border border-black/5 shadow-[0_24px_80px_rgba(22,18,13,0.12)]"
    data-zoomable
  />
</template>
