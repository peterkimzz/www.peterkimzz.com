<script setup lang="ts">
type ImageGridColumns = 2 | 3 | 4;
type ImageGridGap = "small" | "medium" | "large";

const props = withDefaults(
  defineProps<{
    columns?: ImageGridColumns;
    gap?: ImageGridGap;
  }>(),
  {
    columns: 2,
    gap: "medium",
  },
);

const gapSizes: Record<ImageGridGap, string> = {
  small: "0.5rem",
  medium: "1rem",
  large: "1.5rem",
};

const gridStyle = computed(() => ({
  "--image-grid-columns": props.columns,
  "--image-grid-gap": gapSizes[props.gap],
}));
</script>

<template>
  <div class="image-grid my-8" :style="gridStyle">
    <slot />
  </div>
</template>

<style scoped>
.image-grid {
  display: grid;
  grid-template-columns: repeat(var(--image-grid-columns), minmax(0, 1fr));
  gap: var(--image-grid-gap);
}

.image-grid :deep(> p),
.image-grid :deep(.post-image) {
  margin-top: 0;
  margin-bottom: 0;
}

@media (max-width: 640px) {
  .image-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
