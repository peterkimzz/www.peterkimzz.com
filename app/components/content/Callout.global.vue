<script setup lang="ts">
type CalloutType = "info" | "tip" | "warning" | "danger";

const props = withDefaults(
  defineProps<{
    type?: CalloutType;
    title?: string;
  }>(),
  {
    type: "info",
    title: undefined,
  },
);

const calloutStyles: Record<
  CalloutType,
  { container: string; label: string; defaultTitle: string }
> = {
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-950",
    label: "text-blue-700",
    defaultTitle: "참고",
  },
  tip: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-950",
    label: "text-emerald-700",
    defaultTitle: "팁",
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-950",
    label: "text-amber-700",
    defaultTitle: "주의",
  },
  danger: {
    container: "border-red-200 bg-red-50 text-red-950",
    label: "text-red-700",
    defaultTitle: "중요",
  },
};

const style = computed(() => calloutStyles[props.type]);
const displayTitle = computed(() => props.title || style.value.defaultTitle);
</script>

<template>
  <aside
    class="callout my-7 rounded-2xl border px-5 py-4 shadow-sm"
    :class="style.container"
    role="note"
    :aria-label="displayTitle"
  >
    <p
      class="callout-title mb-2 text-sm font-bold tracking-[-0.01em]"
      :class="style.label"
    >
      {{ displayTitle }}
    </p>

    <div class="callout-content [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <slot />
    </div>
  </aside>
</template>
