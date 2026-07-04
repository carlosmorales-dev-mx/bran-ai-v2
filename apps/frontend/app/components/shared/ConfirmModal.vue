<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    loading?: boolean;
  }>(),
  {
    title:        "¿Estás seguro?",
    message:      "Esta acción no se puede deshacer.",
    confirmLabel: "Confirmar",
    cancelLabel:  "Cancelar",
    danger:       true,
    loading:      false,
  }
);

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

// Cierra con Escape
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === "Escape" && props.open) emit("cancel");
  };
  window.addEventListener("keydown", handler);
  onUnmounted(() => window.removeEventListener("keydown", handler));
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="emit('cancel')">
        <div class="modal" role="dialog" aria-modal="true">

          <!-- icono -->
          <div class="modal-icon" :class="{ danger }">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.32 1.55 18.68 1.55 19.04C1.55 20.14 2.45 21 3.55 21H20.45C21.55 21 22.45 20.14 22.45 19.04C22.45 18.68 22.36 18.32 22.18 18L13.71 3.86C13.53 3.54 13.28 3.28 12.98 3.1C12.38 2.74 11.62 2.74 11.02 3.1C10.72 3.28 10.47 3.54 10.29 3.86Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <h2>{{ title }}</h2>
          <p>{{ message }}</p>

          <div class="actions">
            <button
              type="button"
              class="btn-cancel"
              :disabled="loading"
              @click="emit('cancel')"
            >
              {{ cancelLabel }}
            </button>

            <button
              type="button"
              class="btn-confirm"
              :class="{ danger }"
              :disabled="loading"
              @click="emit('confirm')"
            >
              <span v-if="loading" class="spinner" />
              {{ loading ? "Eliminando..." : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 8000;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 18px;
  padding: 32px 28px 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

/* ── Icono ─────────────────────────── */
.modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--blue-dim, rgba(45, 91, 227, 0.08));
  color: var(--blue, #2d5be3);
  margin-bottom: 4px;
}

.modal-icon.danger {
  background: #fff1f2;
  color: var(--crimson, #b91c3a);
}

.modal-icon svg {
  width: 26px;
  height: 26px;
}

/* ── Texto ─────────────────────────── */
h2 {
  font-size: 17px;
  color: var(--tx, #1a1d35);
  line-height: 1.3;
}

p {
  font-size: 13px;
  color: var(--tx-s, #5a6180);
  line-height: 1.55;
}

/* ── Botones ────────────────────────── */
.actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  width: 100%;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.15s;
}

.btn-cancel {
  background: var(--bg, #f2f4fb);
  color: var(--tx-s, #5a6180);
  border: 1px solid var(--border, #e4e8f5);
}

.btn-cancel:hover:not(:disabled) {
  background: #e8ecf8;
}

.btn-confirm {
  background: var(--blue, #2d5be3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-confirm.danger {
  background: var(--crimson, #b91c3a);
}

.btn-confirm:hover:not(:disabled) {
  opacity: 0.88;
  transform: translateY(-1px);
}

.btn-cancel:disabled,
.btn-confirm:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

/* ── Spinner inline ──────────────────── */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 999px;
  display: inline-block;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Transición ────────────────────── */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.22s ease;
}

.modal-enter-active .modal {
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active .modal {
  transition: all 0.18s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-from .modal {
  transform: scale(0.9) translateY(16px);
}

.modal-leave-to {
  opacity: 0;
}

.modal-leave-to .modal {
  transform: scale(0.95);
}
</style>