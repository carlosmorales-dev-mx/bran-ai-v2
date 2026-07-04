<script setup lang="ts">
const { t } = useT();

type SendPayload = {
  text: string;
  files: File[];
};

type PendingFile = {
  file: File;
  previewUrl?: string;
};

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "send", payload: SendPayload): void;
}>();

const text          = ref("");
const fileInput     = ref<HTMLInputElement | null>(null);
const menuOpen      = ref(false);
const selectedFiles = ref<PendingFile[]>([]);

const accept = ".pdf,.docx,.xlsx,.csv,.txt,.mp4,.mov,.jpg,.jpeg,.png";

const canSubmit = computed(() =>
  Boolean(text.value.trim() || selectedFiles.value.length)
);

function createPendingFile(file: File): PendingFile {
  return {
    file,
    previewUrl: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined,
  };
}

function submit() {
  if (!canSubmit.value || props.loading) return;

  emit("send", {
    text:  text.value.trim(),
    files: selectedFiles.value.map((item) => item.file),
  });

  cleanupPreviews();
  text.value          = "";
  selectedFiles.value = [];
  menuOpen.value      = false;
}

function openFiles() {
  menuOpen.value = false;
  fileInput.value?.click();
}

function onFiles(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  if (!files.length) return;

  selectedFiles.value = [
    ...selectedFiles.value,
    ...files.map(createPendingFile),
  ];

  input.value = "";
}

function removeFile(index: number) {
  const item = selectedFiles.value[index];
  if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
  selectedFiles.value.splice(index, 1);
}

function cleanupPreviews() {
  for (const item of selectedFiles.value) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  }
}

function formatFileSize(size: number) {
  if (size < 1024)        return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getFileIcon(file: File) {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type.startsWith("image/"))                        return "🖼️";
  if (type.startsWith("video/"))                        return "🎬";
  if (name.endsWith(".pdf"))                            return "📄";
  if (name.endsWith(".xlsx") || name.endsWith(".csv"))  return "📊";
  if (name.endsWith(".docx") || name.endsWith(".txt"))  return "📝";
  return "📎";
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submit();
  }
}

onBeforeUnmount(() => cleanupPreviews());
</script>

<template>
  <div class="composer-shell">

    <!-- ── PENDING FILES ──────────────────────── -->
    <div v-if="selectedFiles.length" class="pending-files">
      <div
        v-for="(item, index) in selectedFiles"
        :key="`${item.file.name}-${item.file.size}-${index}`"
        class="pending-file-card"
      >
        <img
          v-if="item.previewUrl"
          :src="item.previewUrl"
          :alt="item.file.name"
          class="pending-thumb"
        />
        <div v-else class="pending-icon">
          {{ getFileIcon(item.file) }}
        </div>

        <div class="pending-info">
          <span class="pending-name">{{ item.file.name }}</span>
          <span class="pending-size">{{ formatFileSize(item.file.size) }}</span>
        </div>

        <button
          type="button"
          class="remove-file"
          :disabled="loading"
          @click="removeFile(index)"
        >×</button>
      </div>
    </div>

    <!-- ── INPUT SHELL ────────────────────────── -->
    <div class="input-shell">
      <input
        ref="fileInput"
        type="file"
        multiple
        hidden
        :accept="accept"
        @change="onFiles"
      />

      <!-- attach button -->
      <div class="tools">
        <button
          class="tool-main"
          type="button"
          :disabled="loading"
          @click="menuOpen = !menuOpen"
        >+</button>

        <div v-if="menuOpen" class="tool-menu">
          <button type="button" @click="openFiles">
            <span>📄</span> Documento
          </button>
          <button type="button" @click="openFiles">
            <span>🖼️</span> Imagen
          </button>
          <button type="button" @click="openFiles">
            <span>🎬</span> Video
          </button>
        </div>
      </div>

      <!-- textarea -->
      <textarea
        v-model="text"
        rows="1"
        class="chat-input"
        :placeholder="t('chat_placeholder')"
        :disabled="loading"
        @keydown="onKeydown"
      />

      <!-- send -->
      <button
        class="send-btn"
        type="button"
        :disabled="loading || !canSubmit"
        @click="submit"
      >
        <svg viewBox="0 0 24 24" fill="none" class="send-icon">
          <path d="M5 12L19 5L14 19L11 13L5 12Z" fill="currentColor" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.composer-shell {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 10px;
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.06);
}

/* ── PENDING FILES ──────────────────────────── */
.pending-files {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 10px;
}

.pending-file-card {
  position: relative;
  width: 160px;
  min-width: 160px;
  border: 1px solid #fecdd3;
  background: #fff1f2;
  border-radius: 14px;
  padding: 8px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
}

.pending-thumb {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  object-fit: cover;
  background: #f8fafc;
}

.pending-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: #ffffff;
  font-size: 20px;
}

.pending-info {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.pending-name {
  color: #0f172a;
  font-size: 11px;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.pending-size {
  color: #64748b;
  font-size: 10px;
}

.remove-file {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 999px;
  background: #be123c;
  color: white;
  font-size: 14px;
  display: grid;
  place-items: center;
  cursor: pointer;
  line-height: 1;
}

.remove-file:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── INPUT SHELL ────────────────────────────── */
.input-shell {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.tools {
  position: relative;
  flex-shrink: 0;
}

.tool-main {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 22px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;
}

.tool-main:hover:not(:disabled) {
  background: #fff1f2;
  color: #be123c;
  border-color: #fecdd3;
}

.tool-main:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tool-menu {
  position: absolute;
  bottom: 48px;
  left: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
  z-index: 10;
  min-width: 140px;
  display: grid;
  gap: 2px;
}

.tool-menu button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  color: #334155;
  font-size: 13px;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.15s;
  font-family: inherit;
  text-align: left;
}

.tool-menu button:hover {
  background: #f8fafc;
}

.chat-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  color: #1e293b;
  line-height: 1.5;
  max-height: 160px;
  overflow-y: auto;
  padding: 8px 4px;
}

.chat-input::placeholder {
  color: #94a3b8;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: none;
  background: #be123c;
  color: white;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.send-btn:hover:not(:disabled) {
  background: #9f0f35;
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.send-icon {
  width: 18px;
  height: 18px;
}
</style>