<script setup lang="ts">
import { getYouTubeVideoId } from "~/utils/youtube";

const props = withDefaults(
  defineProps<{
    url?: string;
    title?: string;
    caption?: string;
  }>(),
  {
    url: "",
    title: "YouTube 영상",
    caption: undefined,
  },
);

const videoId = computed(() => getYouTubeVideoId(props.url));
const embedUrl = computed(() =>
  videoId.value
    ? `https://www.youtube-nocookie.com/embed/${videoId.value}`
    : null,
);
</script>

<template>
  <figure class="youtube-embed my-8 w-full max-w-full">
    <div
      v-if="embedUrl"
      class="aspect-video overflow-hidden rounded-2xl border border-black/5 bg-black shadow-[0_24px_80px_rgba(22,18,13,0.12)]"
    >
      <iframe
        :src="embedUrl"
        :title="props.title"
        class="h-full w-full"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="
          accelerometer;
          autoplay;
          clipboard-write;
          encrypted-media;
          gyroscope;
          picture-in-picture;
          web-share;
        "
        allowfullscreen
      />
    </div>

    <div
      v-else
      class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center text-sm font-medium text-gray-500"
    >
      올바른 YouTube URL 또는 영상 ID를 입력해 주세요.
    </div>

    <figcaption
      v-if="props.caption"
      class="mt-3 text-center text-sm font-medium leading-6 text-gray-500"
    >
      {{ props.caption }}
    </figcaption>
  </figure>
</template>
