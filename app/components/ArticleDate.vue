<script setup lang="ts">
const props = defineProps<{
  value?: string;
}>();

const formatted = computed(() => {
  if (!props.value) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(props.value));
});
</script>

<template>
  <time :datetime="value" class="text-sm font-medium text-gray-900">
    {{ formatted }}
  </time>
</template>
