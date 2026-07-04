<script setup lang="ts">
import { useAuthStore } from "@stores/auth";

// ✅ FIX: La raíz "/" redirige según rol — no duplica admin/index.vue
definePageMeta({
  middleware: "auth",
});

const auth = useAuthStore();

// Redirige después de que middleware confirma autenticación
await navigateTo(auth.user?.role === "ADMIN" ? "/admin" : "/chat", {
  replace: true,
});
</script>

<template>
  <!-- No se renderiza nada — solo redirect -->
  <div />
</template>