<script setup lang="ts">
defineProps<{
  label?: string;
  value?: string | number;
  sub?: string;
  trend?: string;
  tone?: "crimson" | "blue" | "yellow" | "green";
  values?: number[];
}>();
// ✅ eliminado: computed muerto con bug (defineProps as any)
</script>

<template>
  <article class="stat-card">
    <div class="top">
      <span>{{ label || "Metric" }}</span>
      <Spark :values="values" :tone="tone || 'crimson'" />
    </div>

    <strong>{{ value || "0" }}</strong>

    <small :class="`tone-${tone || 'crimson'}`">
      {{ trend || sub || "—" }}
    </small>
  </article>
</template>

<style scoped>
.stat-card {
  min-height: 142px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 13px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 13px;
  box-shadow: var(--shadow);
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.top span {
  font-size: 11px;
  color: var(--tx-m);
  letter-spacing: 0.07em;
  text-transform: uppercase;
  font-weight: 800;
}

strong {
  font-size: 27px;
  line-height: 1;
  color: var(--tx);
}

small {
  font-size: 12px;
  font-weight: 700;
}

.tone-crimson { color: var(--crimson); }
.tone-blue    { color: var(--blue); }
.tone-yellow  { color: var(--yellow); }
.tone-green   { color: var(--green); }
</style>