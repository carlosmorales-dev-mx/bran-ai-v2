<script setup lang="ts">
const { t } = useT();

const props = defineProps<{
  sessions: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    isDraft?: boolean;
  }[];
  activeSessionId?: string | null;
  loading?: boolean;
}>();

defineEmits<{
  (e: "select", sessionId: string): void;
  (e: "new"): void;
  (e: "logout"): void;
}>();

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-MX", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

const visibleSessions = computed(() => props.sessions || []);
</script>

<template>
  <div class="history-panel">

    <!-- ── BRAND ───────────────────────────────── -->
    <div class="brand">
      <div class="brand-mark">B</div>
      <div class="brand-text">
        <h2>bran.ai</h2>
        <p>{{ t("chat_conversations") }}</p>
      </div>
    </div>

    <!-- ── HEADER ──────────────────────────────── -->
    <div class="history-header">
      <div>
        <h3>{{ t("chat_conversations") }}</h3>
        <p>{{ t("chat_history") }}</p>
      </div>
      <button class="new-btn" type="button" @click="$emit('new')">
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- ── SESSIONS ────────────────────────────── -->
    <div v-if="loading" class="history-empty">{{ t("chat_loading_history") }}</div>

    <div v-else-if="!visibleSessions.length" class="history-empty">
      <svg viewBox="0 0 40 40" fill="none" style="width:36px;height:36px;opacity:.25;display:block;margin:0 auto 8px">
        <path d="M32 22a1.5 1.5 0 0 1-1.5 1.5H11L5 29V9.5A1.5 1.5 0 0 1 6.5 8h24A1.5 1.5 0 0 1 32 9.5V22z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ t("chat_no_history") }}
    </div>

    <div v-else class="history-list">
      <button
        v-for="session in visibleSessions"
        :key="session.id"
        class="history-item"
        :class="{ active: activeSessionId === session.id, draft: session.isDraft }"
        type="button"
        @click="$emit('select', session.id)"
      >
        <!-- SVG chat icon -->
        <div class="history-icon">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M13.5 9.5a1 1 0 0 1-1 1H4.5L2 13V3.5a1 1 0 0 1 1-1h9.5a1 1 0 0 1 1 1v6z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4.5 6.5h7M4.5 8.5h4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="history-item-content">
          <div class="history-title">
            {{ session.title || t("chat_untitled_conv") }}
          </div>
          <div class="history-date">
            {{ session.isDraft ? t("chat_draft_unsaved") : formatDate(session.createdAt) }}
          </div>
        </div>
      </button>
    </div>

    <!-- ── FOOTER ──────────────────────────────── -->
    <div class="history-footer">
      <button class="new-conversation" type="button" @click="$emit('new')">
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        {{ t("chat_new_conversation") }}
      </button>

      <button class="logout" type="button" @click="$emit('logout')">
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M6 13H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M10.5 11l3-3-3-3M13.5 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ t("nav_logout") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.history-panel {
  height: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Brand ─────────────────────────── */
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding-bottom: 16px;
  margin-bottom: 14px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #f43f5e, #be123c);
  color: white;
  font-weight: 800;
  font-size: 16px;
  box-shadow: 0 8px 20px rgba(244, 63, 94, 0.22);
  flex-shrink: 0;
}

.brand-text h2 { margin: 0; font-size: 16px; color: #0f172a; font-weight: 700; }
.brand-text p  { margin: 2px 0 0; font-size: 11px; color: #64748b; }

/* ── Header ────────────────────────── */
.history-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.history-header h3 { margin: 0; font-size: 14px; color: #0f172a; font-weight: 700; }
.history-header p  { margin: 3px 0 0; font-size: 11px; color: #64748b; }

.new-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 10px;
  background: #f43f5e;
  color: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  transition: opacity 0.15s, transform 0.15s;
}

.new-btn svg { width: 14px; height: 14px; }
.new-btn:hover { opacity: 0.88; transform: scale(1.05); }

/* ── List ──────────────────────────── */
.history-list {
  flex: 1;
  overflow-y: auto;
  display: grid;
  align-content: start;
  gap: 6px;
  padding-right: 2px;
  min-height: 0;
}

.history-item {
  width: 100%;
  text-align: left;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 13px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  gap: 10px;
  align-items: center;
  transition: all 0.15s ease;
  font-family: inherit;
}

.history-item:hover {
  border-color: #fda4af;
  background: #fff1f2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(190, 18, 60, 0.06);
}

.history-item.active {
  border-color: #e11d48;
  background: #fff1f2;
}

.history-item.draft {
  border-style: dashed;
  background: #fff7ed;
}

/* SVG chat icon */
.history-icon {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 9px;
  background: #ffe4e6;
  color: #be123c;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.history-item.active .history-icon {
  background: #fecdd3;
}

.history-icon svg { width: 14px; height: 14px; }

.history-item-content { min-width: 0; flex: 1; }

.history-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.history-date {
  margin-top: 3px;
  font-size: 10.5px;
  color: #64748b;
}

.history-empty {
  color: #94a3b8;
  font-size: 13px;
  padding: 12px 4px;
  line-height: 1.6;
  flex: 1;
  text-align: center;
}

/* ── Footer ────────────────────────── */
.history-footer {
  display: grid;
  gap: 7px;
  padding-top: 12px;
  margin-top: auto;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.new-conversation {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #f43f5e, #be123c);
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: opacity 0.15s;
  box-shadow: 0 4px 14px rgba(244, 63, 94, 0.2);
}

.new-conversation svg { width: 14px; height: 14px; }
.new-conversation:hover { opacity: 0.88; }

.logout {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  border-radius: 12px;
  padding: 9px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: all 0.15s;
}

.logout svg { width: 14px; height: 14px; }
.logout:hover { color: #be123c; border-color: #fecdd3; background: #fff1f2; }

/* Responsive */
@media (max-width: 860px) { .history-panel { border-radius: 22px; } }
@media (max-width: 480px) {
  .history-panel { padding: 14px; border-radius: 20px; }
  .brand { padding-bottom: 12px; margin-bottom: 12px; }
  .brand-mark { width: 34px; height: 34px; border-radius: 11px; }
  .new-btn { display: none; }
}
</style>