<script setup lang="ts">
import ClientChat from "@client/ClientChat.vue";

definePageMeta({
  layout: "client",
  middleware: "client",
});
</script>

<template>
  <ClientChat />
</template>