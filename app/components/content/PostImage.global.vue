<script setup lang="ts">
import type { StyleValue } from "vue";

type PostImageAlign = "left" | "center" | "right";
type PostImageSize = "small" | "medium" | "large" | "full";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    title?: string;
    width?: string | number;
    height?: string | number;
    align?: PostImageAlign;
    size?: PostImageSize;
  }>(),
  {
    src: "",
    alt: "",
    title: undefined,
    width: undefined,
    height: undefined,
    align: "center",
    size: "full",
  },
);

const sizeMaxWidths: Record<PostImageSize, string> = {
  small: "320px",
  medium: "520px",
  large: "720px",
  full: "100%",
};

const alignmentClasses: Record<PostImageAlign, string> = {
  left: "mr-auto ml-0",
  center: "mx-auto",
  right: "mr-0 ml-auto",
};

const figureStyle = computed<StyleValue>(() => ({
  maxWidth: sizeMaxWidths[props.size],
}));
</script>

<template>
  <figure
    class="post-image my-8 w-full max-w-full"
    :class="alignmentClasses[props.align]"
    :style="figureStyle"
  >
    <img
      :src="props.src"
      :alt="props.alt"
      :title="props.title"
      :width="props.width"
      :height="props.height"
      loading="lazy"
      class="block h-auto w-full rounded-3xl border border-black/5 shadow-[0_24px_80px_rgba(22,18,13,0.12)]"
      data-zoomable
    />
  </figure>
</template>
