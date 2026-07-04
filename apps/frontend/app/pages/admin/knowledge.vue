<script setup lang="ts">
import KnowledgePanel from "@admin/KnowledgePanel.vue";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});
</script>

<template>
  <KnowledgePanel />
</template>