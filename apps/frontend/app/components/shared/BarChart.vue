<script setup lang="ts">
const props = defineProps<{
  values?: number[];
  labels?: string[];
}>();

const normalized = computed(() => {
  const values = props.values?.length
    ? props.values
    : Array.from({ length: 30 }, (_, index) => index + 1);

  const max = Math.max(...values, 1);

  return values.map((value) => {
    if (!value) return 10;
    return Math.max(10, Math.round((value / max) * 100));
  });
});

const firstLabel = computed(() => props.labels?.[0] || "Apr 1");
const lastLabel = computed(() => props.labels?.[props.labels.length - 1] || "Apr 29");
</script>

<template>
  <div class="chart-wrap">
    <div class="bars">
      <span
        v-for="(height, index) in normalized"
        :key="index"
        :style="{ height: `${height}%` }"
        :title="`${values?.[index] || 0} tokens`"
      />
    </div>

    <div class="axis">
      <small>{{ firstLabel }}</small>
      <small>{{ lastLabel }}</small>
    </div>
  </div>
</template>

<style scoped>
.chart-wrap {
  display: grid;
  gap: 10px;
}

.bars {
  height: 128px;
  display: flex;
  align-items: flex-end;
  gap: 5px;
}

span {
  flex: 1;
  min-width: 5px;
  background: linear-gradient(180deg, var(--crimson-light), var(--crimson));
  opacity: 0.78;
  border-radius: 4px 4px 0 0;
}

span:nth-child(1),
span:nth-child(2),
span:nth-child(3),
span:nth-child(4),
span:nth-child(5) {
  opacity: 0.24;
}

span:nth-child(6),
span:nth-child(7),
span:nth-child(8),
span:nth-child(9),
span:nth-child(10) {
  opacity: 0.36;
}

span:nth-child(11),
span:nth-child(12),
span:nth-child(13),
span:nth-child(14),
span:nth-child(15) {
  opacity: 0.48;
}

.axis {
  display: flex;
  justify-content: space-between;
}

.axis small {
  color: var(--tx-m);
  font-size: 11px;
}
</style>