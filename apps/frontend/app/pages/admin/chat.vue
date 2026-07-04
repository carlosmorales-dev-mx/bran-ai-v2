<script setup lang="ts">
import AdminChatPanel from "@admin/AdminChatPanel.vue";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});
</script>

<template>
  <AdminChatPanel />
</template>