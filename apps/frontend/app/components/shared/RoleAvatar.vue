<script setup lang="ts">
defineProps<{
  role: "user" | "assistant";
}>();
</script>

<template>
  <div class="role-avatar" :class="role">
    <!-- USER -->
    <svg
      v-if="role === 'user'"
      viewBox="0 0 24 24"
      fill="none"
      class="role-icon"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8" />
      <path
        d="M4 20C4.8 16.8 7.8 15 12 15C16.2 15 19.2 16.8 20 20"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </svg>

    <!-- AI -->
    <svg
      v-else
      viewBox="0 0 24 24"
      fill="none"
      class="role-icon"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="5" y="7" width="14" height="10" rx="3" stroke="currentColor" stroke-width="1.8" />
      <path d="M9 12H9.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      <path d="M15 12H15.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      <path d="M12 7V4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M9 17V20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M15 17V20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  </div>
</template>

<style scoped>
.role-avatar {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 999px;
  display: grid;
  place-items: center;
}

.role-avatar.user {
  background: #e2e8f0;
  color: #334155;
}

.role-avatar.assistant {
  background: #fee2e2;
  color: #be123c;
}

.role-icon {
  width: 20px;
  height: 20px;
}
</style>