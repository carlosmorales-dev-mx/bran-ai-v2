<script setup lang="ts">
const route = useRoute();
const { t } = useT();

const pageTitle = computed(() => {
  if (route.path.includes("/knowledge")) return t("page_knowledge");
  if (route.path.includes("/chat"))      return t("page_sessions");
  return t("page_dashboard");
});

const services = [
  { label: "NestJS",       color: "#16a34a" },
  { label: "FastAPI",      color: "#2d5be3" },
  { label: "Gemini Flash", color: "#4f46e5" },
  { label: "Aiven",        color: "#16955a" },
];
</script>

<template>
  <header class="topbar">
    <div class="crumb">
      <span>bran.ai</span>
      <b>/ {{ pageTitle }}</b>
    </div>

    <div class="status">
      <span
        v-for="service in services"
        :key="service.label"
        class="service"
      >
        <i :style="{ background: service.color }" />
        {{ service.label }}
      </span>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 50px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0;
}

.crumb span {
  color: var(--tx-m);
  font-size: 12px;
}

.crumb b {
  margin-left: 6px;
  font-size: 12px;
  color: var(--tx);
}

.status {
  display: flex;
  gap: 16px;
  align-items: center;
}

.service {
  color: var(--tx-m);
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.service i {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  box-shadow: 0 0 0 3px rgba(22, 149, 90, 0.08);
}

@media (max-width: 860px) {
  .status {
    display: none;
  }
}
</style>