<script setup lang="ts">
import { toPublicSrc } from "~/utils/content";

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
    :src="toPublicSrc(props.src)"
    :alt="props.alt"
    :title="props.title"
    :width="props.width"
    :height="props.height"
    :align="props.align"
    :size="props.size"
  />
</template>
