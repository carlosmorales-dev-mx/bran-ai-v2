<script setup lang="ts">
const { t } = useT();

type Tab = "file" | "url" | "text";

const emit = defineEmits<{ (event: "uploaded"): void }>();

const { request } = useApi();

const activeTab = ref<Tab>("file");
const fileInput = ref<HTMLInputElement | null>(null);
const loading   = ref(false);
const error     = ref("");
const success   = ref("");

const title    = ref("");
const content  = ref("");
const urlTitle = ref("");
const url      = ref("");

const accept = ".pdf,.docx,.xlsx,.csv,.txt,.mp4,.mov,.jpg,.jpeg,.png";

function resetMessages() { error.value = ""; success.value = ""; }

function openFilePicker() {
  if (loading.value) return;
  fileInput.value?.click();
}

async function uploadFile(file: File) {
  loading.value = true;
  resetMessages();
  try {
    const form = new FormData();
    form.append("file", file);
    await request("/knowledge/upload", { method: "POST", body: form });
    success.value = `"${file.name}" ${t("up_success_file")}`;
    emit("uploaded");
  } catch (err: any) {
    error.value = err?.message || t("up_error_file");
  } finally { loading.value = false; }
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file  = input.files?.[0];
  if (!file) return;
  await uploadFile(file);
  input.value = "";
}

async function onDrop(event: DragEvent) {
  event.preventDefault();
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  await uploadFile(file);
}

async function submitUrl() {
  if (!url.value.trim()) { error.value = t("up_url_required"); return; }
  loading.value = true;
  resetMessages();
  try {
    await request("/knowledge/url", {
      method: "POST",
      body: { url: url.value.trim(), title: urlTitle.value.trim() || undefined },
    });
    success.value  = t("up_success_url");
    url.value      = "";
    urlTitle.value = "";
    emit("uploaded");
  } catch (err: any) {
    error.value = err?.message || t("up_error_url");
  } finally { loading.value = false; }
}

async function submitText() {
  if (!title.value.trim() || !content.value.trim()) { error.value = t("up_title_required"); return; }
  loading.value = true;
  resetMessages();
  try {
    await request("/knowledge/ingest", {
      method: "POST",
      body: { title: title.value.trim(), content: content.value.trim() },
    });
    success.value = t("up_success_text");
    title.value   = "";
    content.value = "";
    emit("uploaded");
  } catch (err: any) {
    error.value = err?.message || t("up_error_text");
  } finally { loading.value = false; }
}
</script>

<template>
  <div class="upload">

    <!-- ── TABS ───────────────────────────────── -->
    <div class="tabs">
      <button
        v-for="tab in (['file', 'url', 'text'] as Tab[])"
        :key="tab"
        type="button"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        <!-- File icon -->
        <svg v-if="tab === 'file'" viewBox="0 0 16 16" fill="none">
          <path d="M9 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 1v5h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M5 9h6M5 11.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        <!-- URL icon -->
        <svg v-else-if="tab === 'url'" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
          <path d="M8 1.5C6.5 3.5 5.5 5.6 5.5 8s1 4.5 2.5 6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M8 1.5c1.5 2 2.5 4.1 2.5 6.5s-1 4.5-2.5 6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M1.5 8h13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        <!-- Text icon -->
        <svg v-else viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
          <path d="M4.5 5.5h7M4.5 8h7M4.5 10.5h4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        {{ t(tab === "file" ? "up_file" : tab === "url" ? "up_url" : "up_text") }}
      </button>
    </div>

    <!-- ── ALERTS ─────────────────────────────── -->
    <div v-if="error"   class="alert error">
      <svg viewBox="0 0 16 16" fill="none" class="alert-icon">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
        <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      {{ error }}
    </div>
    <div v-if="success" class="alert success">
      <svg viewBox="0 0 16 16" fill="none" class="alert-icon">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
        <path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ success }}
    </div>

    <!-- ── FILE DROP ZONE ─────────────────────── -->
    <div
      v-if="activeTab === 'file'"
      class="drop-zone"
      :class="{ disabled: loading }"
      @click="openFilePicker"
      @dragover.prevent
      @drop="onDrop"
    >
      <input ref="fileInput" type="file" hidden :accept="accept" @change="onFileChange" />

      <div class="drop-icon" :class="{ spinning: loading }">
        <svg v-if="!loading" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="1.4" opacity="0.2"/>
          <path d="M10 18l6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 12v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <svg v-else viewBox="0 0 32 32" fill="none" class="anim-spin">
          <circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2" opacity="0.15"/>
          <path d="M16 4a12 12 0 0 1 12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </div>

      <p class="drop-title">{{ loading ? t("up_uploading") : t("up_drag") }}</p>

      <div class="type-chips">
        <span v-for="chip in ['PDF', 'Video', 'Imagen', 'XLS/CSV', 'DOCX/TXT']" :key="chip">{{ chip }}</span>
      </div>

      <small>max 100 MB</small>
    </div>

    <!-- ── URL FORM ───────────────────────────── -->
    <div v-else-if="activeTab === 'url'" class="text-form">
      <label>
        <span>{{ t("up_url_label") }}</span>
        <input v-model="url" type="url" :placeholder="t('up_url_placeholder')" :disabled="loading" />
      </label>
      <label>
        <span>{{ t("up_url_title") }}</span>
        <input v-model="urlTitle" type="text" :placeholder="t('up_url_title_placeholder')" :disabled="loading" />
      </label>
      <button type="button" :disabled="loading" @click="submitUrl">
        <span v-if="loading" class="btn-spinner" />
        <svg v-else viewBox="0 0 16 16" fill="none" class="btn-icon">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
          <path d="M5.5 8h5M8 5.5l2.5 2.5L8 10.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ loading ? t("up_indexing_url") : t("up_index_url") }}
      </button>
    </div>

    <!-- ── TEXT FORM ──────────────────────────── -->
    <div v-else class="text-form">
      <label>
        <span>{{ t("up_title_label") }}</span>
        <input v-model="title" type="text" :placeholder="t('up_title_placeholder')" :disabled="loading" />
      </label>
      <label>
        <span>{{ t("up_content_label") }}</span>
        <textarea v-model="content" rows="6" :placeholder="t('up_content_placeholder')" :disabled="loading" />
      </label>
      <button type="button" :disabled="loading" @click="submitText">
        <span v-if="loading" class="btn-spinner" />
        <svg v-else viewBox="0 0 16 16" fill="none" class="btn-icon">
          <path d="M2 8l4 4 8-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ loading ? t("up_indexing_text") : t("up_index_text") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.upload {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

/* ── Tabs ──────────────────────────── */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  background: #fafbff;
}

.tabs button {
  flex: 1;
  padding: 11px 8px;
  border: none;
  background: transparent;
  color: var(--tx-s);
  font-size: 12.5px;
  cursor: pointer;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tabs button svg { width: 14px; height: 14px; }

.tabs button.active {
  color: var(--crimson);
  background: white;
  border-bottom-color: var(--crimson);
  font-weight: 700;
}

.tabs button:hover:not(.active) {
  color: var(--tx);
  background: rgba(0,0,0,0.02);
}

/* ── Alerts ─────────────────────────── */
.alert {
  margin: 12px 18px 0;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 12.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-icon { width: 14px; height: 14px; flex-shrink: 0; }

.alert.error   { color: var(--crimson); background: #fff1f2; border: 1px solid #fecdd3; }
.alert.success { color: #166534;        background: #f0fdf4; border: 1px solid #bbf7d0; }

/* ── Drop zone ──────────────────────── */
.drop-zone {
  margin: 18px;
  border: 2px dashed var(--border);
  border-radius: 13px;
  padding: 28px 24px;
  text-align: center;
  background: #fafbff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.drop-zone:hover:not(.disabled) {
  border-color: var(--crimson-light);
  background: #fff8f9;
}

.drop-zone.disabled {
  opacity: 0.65;
  cursor: wait;
}

.drop-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--crimson-dim);
  color: var(--crimson);
  display: grid;
  place-items: center;
}

.drop-icon svg { width: 28px; height: 28px; }
.anim-spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.drop-title { color: var(--tx-s); font-size: 13px; font-weight: 700; }

.type-chips {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.type-chips span {
  font-size: 10px;
  color: var(--crimson);
  background: var(--crimson-dim);
  border-radius: 999px;
  padding: 3px 9px;
  font-weight: 700;
}

small { color: var(--tx-m); font-size: 11px; }

/* ── Forms ──────────────────────────── */
.text-form { padding: 18px; display: grid; gap: 13px; }

label { display: grid; gap: 5px; }

label span {
  font-size: 12px;
  font-weight: 700;
  color: var(--tx-s);
}

input, textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
  outline: none;
  resize: vertical;
  background: white;
  font-size: 13px;
  color: var(--tx);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.text-form button {
  justify-self: flex-start;
  border: none;
  background: var(--crimson);
  color: white;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: opacity 0.15s;
}

.text-form button:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-icon { width: 14px; height: 14px; }
.btn-spinner {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 999px;
  display: inline-block;
  animation: spin 0.7s linear infinite;
}
</style>