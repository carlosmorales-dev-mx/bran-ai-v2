<script setup lang="ts">
defineProps<{
  label?: string;
  error?: string;
}>();
</script>

<template>
  <label class="field">
    <span>{{ label }}</span>
    <slot />
    <small v-if="error">{{ error }}</small>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

span {
  font-size: 12px;
  color: var(--tx-s);
  font-weight: 500;
}

small {
  color: var(--crimson);
  font-size: 11px;
}
</style>
