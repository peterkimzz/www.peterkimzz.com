<script setup lang="ts">
const props = defineProps<{
  src?: string;
  alt?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  align?: "left" | "center" | "right";
  size?: "small" | "medium" | "large" | "full";
}>();
</script>

<template>
  <PostImage
    :src="props.src"
    :alt="props.alt"
    :title="props.title"
    :width="props.width"
    :height="props.height"
    :align="props.align"
    :size="props.size"
  />
</template>
