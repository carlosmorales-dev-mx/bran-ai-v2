<script setup lang="ts">
const { toasts, remove } = useToast();

const icons: Record<string, string> = {
  success: "✓",
  error:   "✕",
  info:    "ℹ",
  warning: "⚠",
};
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type}`"
          role="alert"
          @click="remove(toast.id)"
        >
          <span class="toast-icon">{{ icons[toast.type] }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" type="button" @click.stop="remove(toast.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  pointer-events: all;
  min-width: 300px;
  max-width: 420px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(26, 29, 53, 0.14), 0 2px 8px rgba(26, 29, 53, 0.08);
  border: 1px solid transparent;
}

/* ── Tipos ─────────────────────────── */
.toast-success {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.toast-error {
  background: #fff1f2;
  color: var(--crimson, #b91c3a);
  border-color: #fecdd3;
}

.toast-info {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.toast-warning {
  background: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

/* ── Partes ─────────────────────────── */
.toast-icon {
  font-size: 15px;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.toast-msg {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: inherit;
  font-size: 17px;
  line-height: 1;
  opacity: 0.55;
  cursor: pointer;
  padding: 0 2px;
  transition: opacity 0.15s;
}

.toast-close:hover {
  opacity: 1;
}

/* ── Animación ─────────────────────── */
.toast-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
</style>