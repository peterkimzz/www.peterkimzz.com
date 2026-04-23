<script setup lang="ts">
const route = useRoute();
const container = ref<HTMLDivElement | null>(null);

function renderComments() {
  if (!import.meta.client || !container.value) {
    return;
  }

  container.value.innerHTML = "";

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", "peterkimzz/blog");
  script.setAttribute("data-repo-id", "MDEwOlJlcG9zaXRvcnkzMjAyNTkyMTY=");
  script.setAttribute("data-category", "Blog Comments");
  script.setAttribute("data-category-id", "DIC_kwDOExbEkM4B-8Mf");
  script.setAttribute("data-mapping", "title");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", "preferred_color_scheme");
  script.setAttribute("data-lang", "ko");
  script.setAttribute("data-loading", "lazy");

  container.value.appendChild(script);
}

onMounted(() => {
  renderComments();
});

watch(
  () => route.fullPath,
  () => {
    renderComments();
  },
);
</script>

<template>
  <div class="mt-12">
    <div ref="container" class="giscus" />
  </div>
</template>
