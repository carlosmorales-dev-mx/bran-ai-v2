<script setup lang="ts">
const { t } = useT();
const { success, error: toastError } = useToast();

type FilterType = "all" | "pdf" | "video" | "image" | "url" | "text" | "file";
type KnowledgeDocument = {
  id: string; title: string; type: string; source: string; status: string;
  url?: string | null; sizeBytes?: number | null; chunks?: number;
  ragDocumentId?: string | null; createdAt: string; updatedAt: string;
  uploadedBy?: { id: string; name: string; email: string } | null;
};
type RagMetrics = { documents?: number; chunks?: number; status?: string };

const { request } = useApi();
const docs    = ref<KnowledgeDocument[]>([]);
const metrics = ref<RagMetrics | null>(null);
const loading = ref(true);
const error   = ref("");

const search       = ref("");
const activeFilter = ref<FilterType>("all");

const confirmOpen    = ref(false);
const confirmLoading = ref(false);
const pendingDoc     = ref<KnowledgeDocument | null>(null);

// ✅ NUEVO: estado de reindexado por documento
const reindexingId = ref<string | null>(null);

const filters = computed((): { label: string; value: FilterType }[] => [
  { label: t("know_filter_all"), value: "all" },
  { label: "PDF", value: "pdf" }, { label: "Video", value: "video" },
  { label: "Imagen", value: "image" }, { label: "URL", value: "url" },
  { label: "Texto", value: "text" }, { label: "File", value: "file" },
]);

const indexedCount = computed(() => docs.value.filter(d => d.status === "INDEXED").length);
const chunks = computed(() => {
  const local = docs.value.reduce((sum, d) => sum + (d.chunks || 0), 0);
  return local || metrics.value?.chunks || metrics.value?.documents || 0;
});

const filteredDocs = computed(() => {
  const q = search.value.trim().toLowerCase();
  return docs.value.filter(doc => {
    const ms = !q || doc.title.toLowerCase().includes(q) || doc.type.toLowerCase().includes(q)
      || doc.source.toLowerCase().includes(q) || doc.url?.toLowerCase().includes(q)
      || doc.uploadedBy?.name?.toLowerCase().includes(q) || doc.uploadedBy?.email?.toLowerCase().includes(q);
    const mf = activeFilter.value === "all" || normalizedType(doc) === activeFilter.value;
    return ms && mf;
  });
});

function normalizedType(doc: KnowledgeDocument): FilterType {
  if (doc.type === "pdf") return "pdf";
  if (doc.type === "video") return "video";
  if (doc.type === "image") return "image";
  if (doc.type === "url" || doc.source === "url") return "url";
  if (doc.type === "text" || doc.source === "manual") return "text";
  return "file";
}

function formatDate(v: string) {
  if (!v) return "";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(v));
}
function formatSize(v?: number | null) {
  if (!v) return "—";
  if (v >= 1048576) return `${(v/1048576).toFixed(1)} MB`;
  if (v >= 1024) return `${Math.round(v/1024)} KB`;
  return `${v} B`;
}
function badgeColor(s: string) {
  return s === "INDEXED" ? "#16a34a" : s === "ERROR" ? "#dc2626" : s === "PENDING" ? "#d97706" : "#64748b";
}
function badgeLabel(s: string) {
  return s === "INDEXED" ? "indexed" : s === "ERROR" ? "error" : s === "PENDING" ? "processing" : s.toLowerCase();
}

async function loadKnowledge() {
  loading.value = true; error.value = "";
  try {
    const [docsRes, metricsRes] = await Promise.allSettled([
      request<KnowledgeDocument[]>("/knowledge"),
      request<RagMetrics>("/knowledge/metrics"),
    ]);
    if (docsRes.status === "fulfilled") docs.value = docsRes.value || [];
    else throw docsRes.reason;
    if (metricsRes.status === "fulfilled") metrics.value = metricsRes.value;
  } catch (err: any) {
    error.value = err?.message || "No pude cargar la base de conocimiento.";
    toastError(error.value);
  } finally { loading.value = false; }
}

function askDelete(doc: KnowledgeDocument) { pendingDoc.value = doc; confirmOpen.value = true; }
function cancelDelete() { if (confirmLoading.value) return; confirmOpen.value = false; pendingDoc.value = null; }

async function confirmDelete() {
  if (!pendingDoc.value) return;
  const doc = pendingDoc.value;
  confirmLoading.value = true;
  try {
    await request(`/knowledge/${doc.id}`, { method: "DELETE" });
    docs.value = docs.value.filter(i => i.id !== doc.id);
    success(`"${doc.title}" eliminado correctamente.`);
    confirmOpen.value = false; pendingDoc.value = null;
  } catch (err: any) {
    toastError(err?.message || "No pude eliminar el contexto.");
  } finally { confirmLoading.value = false; }
}

// ✅ NUEVO: reindexar un documento sin volver a subirlo
async function reindexDocument(doc: KnowledgeDocument) {
  reindexingId.value = doc.id;
  try {
    const updated = await request<KnowledgeDocument>(`/knowledge/${doc.id}/reindex`, {
      method: "POST",
    });
    docs.value = docs.value.map((d) => (d.id === doc.id ? { ...d, ...updated } : d));
    success(`"${doc.title}" reindexado correctamente.`);
  } catch (err: any) {
    toastError(err?.message || "No pude reindexar el documento.");
  } finally {
    reindexingId.value = null;
  }
}

onMounted(loadKnowledge);
</script>

<template>
  <section class="knowledge">
    <div class="heading">
      <div>
        <h1>{{ t("know_title") }}</h1>
        <p>{{ indexedCount }} {{ t("know_sources") }} · {{ chunks }} {{ t("know_chunks") }} · {{ metrics?.status || t("know_unknown_status") }}</p>
      </div>
      <button type="button" :disabled="loading" @click="loadKnowledge">
        <span v-if="loading" class="btn-spinner" />
        <svg v-else viewBox="0 0 18 18" fill="none" class="btn-icon">
          <path d="M16 9A7 7 0 1 1 9 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M9 2l2.5 2.5L9 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ loading ? t("know_loading") : t("know_refresh") }}
      </button>
    </div>

    <div v-if="error" class="alert">{{ error }}</div>

    <UploadBox @uploaded="loadKnowledge" />

    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.6"/>
          <path d="M14 14l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        <input v-model="search" type="search" :placeholder="t('know_search')" />
      </div>
      <div class="filter-row">
        <button v-for="f in filters" :key="f.value" type="button"
          :class="{ active: activeFilter === f.value }" @click="activeFilter = f.value">
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="skeletons">
      <div v-for="n in 4" :key="n" class="skeleton-row">
        <div class="sk sk-icon" />
        <div class="sk-body"><div class="sk sk-title" /><div class="sk sk-meta" /></div>
        <div class="sk sk-badge" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredDocs.length" class="empty">
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5" opacity="0.18"/>
        <path d="M16 30l5-7 4 5 3-4 5 6H15z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/>
        <circle cx="32" cy="16" r="3" stroke="currentColor" stroke-width="1.4" opacity="0.35"/>
      </svg>
      <p>{{ t("know_empty") }}</p>
    </div>

    <!-- Docs -->
    <TransitionGroup v-else name="list" tag="div" class="docs">
      <article v-for="doc in filteredDocs" :key="doc.id"
        :class="{ processing: doc.status === 'PENDING', 'doc-error': doc.status === 'ERROR' }">
        <FileTypeIcon :type="doc.type" />

        <div class="doc-main">
          <div class="doc-title-row">
            <h3>{{ doc.title }}</h3>
            <a v-if="doc.url" :href="doc.url" target="_blank" rel="noreferrer" class="ext-link" title="Abrir URL">
              <svg viewBox="0 0 14 14" fill="none">
                <path d="M6 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                <path d="M8 1h5v5M13 1L7 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
          <p>{{ doc.type }} · {{ doc.source }} · {{ formatSize(doc.sizeBytes) }} · {{ doc.uploadedBy?.name || t("know_admin") }} · {{ formatDate(doc.createdAt) }}</p>
          <div v-if="doc.status === 'PENDING'" class="progress"><i /></div>
        </div>

        <div class="meta">
          <strong>{{ doc.chunks || 0 }}</strong>
          <span>{{ t("know_chunks_label") }}</span>
        </div>

        <Badge :label="badgeLabel(doc.status)" :color="badgeColor(doc.status)" />

        <!-- ✅ NUEVO: reindexar sin volver a subir el archivo -->
        <button
          type="button"
          class="reindex"
          title="Reindexar"
          :disabled="reindexingId === doc.id || doc.status === 'PENDING'"
          @click="reindexDocument(doc)"
        >
          <span v-if="reindexingId === doc.id" class="btn-spinner-sm" />
          <svg v-else viewBox="0 0 18 18" fill="none">
            <path d="M16 9A7 7 0 1 1 9 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M9 2l2.5 2.5L9 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- ✅ SVG trash — limpio y preciso -->
        <button type="button" class="trash" title="Eliminar" @click="askDelete(doc)">
          <svg viewBox="0 0 18 18" fill="none">
            <path d="M3 5h12M7 5V3h4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 5l1 10h6l1-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7.5 8v5M10.5 8v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>
      </article>
    </TransitionGroup>

    <ConfirmModal
      :open="confirmOpen"
      title="Eliminar documento"
      :message="`¿Eliminar &quot;${pendingDoc?.title}&quot; de la base de conocimiento? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      cancel-label="Cancelar"
      :loading="confirmLoading"
      danger
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>

<style scoped>
.knowledge { height: 100%; overflow-y: auto; padding: 28px 32px; }

.heading { margin-bottom: 24px; display: flex; justify-content: space-between; gap: 16px; align-items: center; }
h1 { font-size: 24px; font-weight: 700; }
.heading p { color: var(--tx-s); font-size: 13px; margin-top: 3px; }

.heading button {
  border: none;
  background: var(--crimson);
  color: white;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: inherit;
  font-size: 13px;
  transition: opacity 0.15s;
}
.heading button:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-icon { width: 14px; height: 14px; }
.btn-spinner {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 999px;
  display: inline-block;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.alert { margin-bottom: 16px; background: #fff1f2; color: var(--crimson); border: 1px solid #fecdd3; border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 700; }

/* Toolbar */
.toolbar { margin-bottom: 14px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.search-wrap { position: relative; width: 220px; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: var(--tx-m); pointer-events: none; }
.search-wrap input { width: 100%; min-height: 38px; border: 1px solid var(--border); border-radius: 11px; padding: 0 13px 0 34px; background: white; font-size: 13px; font-family: inherit; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-row button { min-height: 32px; border: 1px solid var(--border); background: white; color: var(--tx-s); border-radius: 999px; padding: 0 12px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; font-family: inherit; }
.filter-row button.active { border-color: var(--crimson); color: var(--crimson); background: #fff1f2; }

/* Skeleton */
.skeletons { display: flex; flex-direction: column; gap: 9px; }
.skeleton-row { height: 66px; background: var(--surface); border: 1px solid var(--border); border-radius: 13px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
.sk { background: linear-gradient(90deg, #f0f2fa 25%, #e4e8f5 50%, #f0f2fa 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 7px; }
.sk-icon { width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0; }
.sk-body { flex: 1; display: grid; gap: 8px; }
.sk-title { height: 13px; width: 55%; }
.sk-meta { height: 10px; width: 40%; }
.sk-badge { width: 64px; height: 22px; border-radius: 6px; }
@keyframes shimmer { to { background-position: -200% 0; } }

/* Empty */
.empty { background: var(--surface); border: 1px solid var(--border); border-radius: 13px; padding: 52px 24px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.empty svg { width: 56px; height: 56px; color: var(--tx-m); }
.empty p { color: var(--tx-m); font-size: 13px; text-align: center; }

/* Docs */
.docs { display: flex; flex-direction: column; gap: 9px; }

article {
  min-height: 66px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 13px;
  padding: 13px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
article:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
article.processing { border-color: #fed7aa; }
article.doc-error { border-color: #fecdd3; }

.doc-main { flex: 1; min-width: 0; }
.doc-title-row { display: flex; align-items: center; gap: 7px; }

.ext-link {
  color: var(--blue);
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  opacity: 0.7;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.ext-link:hover { opacity: 1; }
.ext-link svg { width: 13px; height: 13px; }

h3 { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
p { color: var(--tx-m); font-size: 11px; margin-top: 3px; }

.progress { height: 3px; background: #e8ecf8; border-radius: 999px; overflow: hidden; margin-top: 8px; }
.progress i { display: block; height: 100%; background: var(--crimson); border-radius: inherit; animation: progress 1.35s ease-in-out infinite; }
@keyframes progress { 0% { width: 15%; } 50% { width: 75%; } 100% { width: 15%; } }

.meta { width: 52px; text-align: right; flex-shrink: 0; }
.meta strong { display: block; color: var(--tx); font-size: 14px; font-weight: 700; }
.meta span { color: var(--tx-m); font-size: 9px; }

/* ✅ NUEVO: botón de reindexar */
.reindex {
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
  display: grid;
  place-items: center;
  color: var(--tx-m);
  flex-shrink: 0;
}
.reindex svg { width: 15px; height: 15px; }
.reindex:hover:not(:disabled) {
  background: var(--blue-dim, rgba(45, 91, 227, 0.08));
  border-color: rgba(45, 91, 227, 0.25);
  color: var(--blue, #2d5be3);
}
.reindex:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-spinner-sm {
  width: 13px; height: 13px;
  border: 2px solid rgba(45, 91, 227, 0.25);
  border-top-color: var(--blue, #2d5be3);
  border-radius: 999px;
  display: inline-block;
  animation: spin 0.7s linear infinite;
}

.trash {
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
  display: grid;
  place-items: center;
  color: var(--tx-m);
  flex-shrink: 0;
}
.trash svg { width: 15px; height: 15px; }
.trash:hover { background: #fff1f2; border-color: #fecdd3; color: var(--crimson); }

/* Transitions */
.list-enter-active { transition: all 0.25s ease; }
.list-leave-active { transition: all 0.2s ease; }
.list-enter-from { opacity: 0; transform: translateY(-8px); }
.list-leave-to { opacity: 0; transform: translateX(16px); }

@media (max-width: 720px) {
  .knowledge { padding: 20px; }
  .heading { align-items: flex-start; flex-direction: column; }
  .toolbar { align-items: stretch; flex-direction: column; }
  .search-wrap { width: 100%; }
  article { align-items: flex-start; }
  .meta { display: none; }
}
</style>
