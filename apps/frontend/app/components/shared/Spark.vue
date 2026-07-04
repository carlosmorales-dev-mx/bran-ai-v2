<script setup lang="ts">
const props = defineProps<{
  values?: number[];
  tone?: "crimson" | "blue" | "yellow" | "green";
}>();

const colorMap = {
  crimson: "var(--crimson)",
  blue: "var(--blue)",
  yellow: "var(--yellow)",
  green: "var(--green)",
};

const stroke = computed(() => colorMap[props.tone || "crimson"]);

const points = computed(() => {
  const values = props.values?.length
    ? props.values
    : [8, 10, 12, 13, 15, 16, 18, 21, 23, 26];

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 72 + 4;
      const y = 28 - ((value - min) / span) * 22;
      return `${x},${y}`;
    })
    .join(" ");
});
</script>

<template>
  <svg class="spark" viewBox="0 0 80 32" preserveAspectRatio="none">
    <polyline
      :points="points"
      fill="none"
      :stroke="stroke"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.spark {
  width: 76px;
  height: 30px;
  opacity: 0.95;
}
</style>