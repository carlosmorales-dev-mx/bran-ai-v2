<script setup lang="ts">
defineProps<{ type?: string }>();
</script>

<template>
  <div class="file-icon" :class="`type-${type || 'file'}`">

    <!-- PDF -->
    <svg v-if="type === 'pdf'" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 13h1.5a1 1 0 0 1 0 2H9v-4h1.5a1 1 0 0 1 0 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 11v4m0-4h1a1.5 1.5 0 0 1 0 3h-1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- VIDEO -->
    <svg v-else-if="type === 'video'" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/>
      <path d="M17 9l5-3v12l-5-3V9z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="8.5" cy="12" r="2" stroke="currentColor" stroke-width="1.3"/>
    </svg>

    <!-- IMAGE -->
    <svg v-else-if="type === 'image'" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.3"/>
      <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- URL / GLOBE -->
    <svg v-else-if="type === 'url'" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
      <path d="M12 3c-2.5 3-4 5.7-4 9s1.5 6 4 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M12 3c2.5 3 4 5.7 4 9s-1.5 6-4 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M3 12h18" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M3 8h18M3 16h18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
    </svg>

    <!-- TEXT / TXT -->
    <svg v-else-if="type === 'text'" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>

    <!-- XLSX / CSV -->
    <svg v-else-if="type === 'xlsx' || type === 'csv'" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 12h8M8 16h8M12 12v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    </svg>

    <!-- DOCX -->
    <svg v-else-if="type === 'docx'" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 12h8M8 15h8M8 18h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    </svg>

    <!-- DEFAULT / FILE -->
    <svg v-else viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</template>

<style scoped>
.file-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: var(--crimson-dim);
  color: var(--crimson);
}

.file-icon svg {
  width: 19px;
  height: 19px;
}

/* ── por tipo ───────────────────────── */
.type-url {
  background: var(--blue-dim);
  color: var(--blue);
}

.type-image {
  background: var(--green-dim);
  color: var(--green);
}

.type-video {
  background: var(--yellow-dim);
  color: var(--yellow);
}

.type-docx {
  background: rgba(45, 91, 227, 0.07);
  color: var(--blue-mid);
}

.type-xlsx,
.type-csv {
  background: var(--green-dim);
  color: var(--green);
}

.type-text {
  background: rgba(100, 116, 139, 0.08);
  color: #475569;
}
</style>