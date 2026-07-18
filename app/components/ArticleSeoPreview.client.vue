<script setup lang="ts">
const props = defineProps<{
  title?: string;
  description?: string;
  image?: string;
  canonical: string;
}>();

const isStudioMounted = ref(false);
let observer: MutationObserver | undefined;

function updateStudioState() {
  isStudioMounted.value = Boolean(document.querySelector("nuxt-studio"));
}

onMounted(() => {
  updateStudioState();
  observer = new MutationObserver(updateStudioState);
  observer.observe(document.body, { childList: true });
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <details
    v-if="isStudioMounted"
    class="mt-8 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 px-5 py-4 text-left"
  >
    <summary class="cursor-pointer text-sm font-bold text-blue-700 select-none">
      관리자용 SEO 미리보기
    </summary>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <section class="rounded-xl border border-gray-200 bg-white p-4">
        <p class="text-xs font-semibold text-gray-500">검색 결과</p>
        <p class="mt-3 truncate text-sm text-emerald-700">
          {{ props.canonical }}
        </p>
        <p class="mt-1 text-xl font-medium text-blue-700">
          {{ props.title }}
        </p>
        <p class="mt-1 line-clamp-2 text-sm leading-5 text-gray-600">
          {{ props.description }}
        </p>
      </section>

      <section
        class="overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <img
          v-if="props.image"
          :src="props.image"
          alt=""
          class="aspect-[1.91/1] w-full object-cover"
        />
        <div
          v-else
          class="flex aspect-[1.91/1] items-center justify-center bg-gray-100 text-sm font-medium text-gray-400"
        >
          공유 이미지 없음
        </div>
        <div class="p-4">
          <p class="truncate text-xs font-semibold text-gray-500">
            {{ props.canonical }}
          </p>
          <p class="mt-1 line-clamp-2 font-bold text-gray-900">
            {{ props.title }}
          </p>
          <p class="mt-1 line-clamp-2 text-sm text-gray-600">
            {{ props.description }}
          </p>
        </div>
      </section>
    </div>
  </details>
</template>
