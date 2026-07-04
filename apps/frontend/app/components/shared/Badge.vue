<script setup lang="ts">
defineProps<{
  label?: string;
  color?: string;
}>();
</script>

<template>
  <span class="badge" :style="{ color: color || 'var(--crimson)', background: (color || '#b91c3a') + '18' }">
    <span class="dot" :style="{ background: color || 'var(--crimson)' }" />
    {{ label || "LIVE" }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  padding: 3px 9px;
  font-family: var(--mono);
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
</style>
