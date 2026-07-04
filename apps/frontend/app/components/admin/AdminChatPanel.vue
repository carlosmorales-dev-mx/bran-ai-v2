<script setup lang="ts">
import ChatMessages from "@shared/ChatMessages.vue";
import ChatInput from "@shared/ChatInput.vue";
import Badge from "@shared/Badge.vue";

const { t } = useT();

type SendPayload = {
  text: string;
  files: File[];
};

const {
  sessions,
  activeSessionId,
  messages,
  loading,
  uploading,
  loadingHistory,
  fetchSessions,
  loadSession,
  sendMessage,
  uploadFiles,
  newConversation,
} = useChat();

const activeSession = computed(() =>
  sessions.value.find((s) => s.id === activeSessionId.value)
);

const title = computed(() => activeSession.value?.title || t("chat_untitled"));

const subtitle = computed(() =>
  activeSession.value?.isDraft
    ? t("chat_draft")
    : t("chat_admin_subtitle")
);

onMounted(async () => {
  await fetchSessions();

  const firstSession = sessions.value[0];

  if (!firstSession) {
    newConversation();
    return;
  }

  if (!activeSessionId.value) {
    await loadSession(firstSession.id);
  }
});

async function handleNewSession() {
  newConversation();
}

async function handleSelectSession(sessionId: string) {
  await loadSession(sessionId);
}

async function handleSend(payload: SendPayload) {
  if (payload.files.length) {
    await uploadFiles(payload.files, payload.text);
    return;
  }
  await sendMessage(payload.text);
}

function formatSessionDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
</script>

<template>
  <section class="admin-chat">

    <!-- ── SESSIONS SIDEBAR ────────────────────── -->
    <aside class="sessions">
      <button type="button" class="new-session" @click="handleNewSession">
        {{ t("chat_new") }}
      </button>

      <div v-if="loadingHistory" class="empty-state">
        {{ t("chat_loading_sessions") }}
      </div>

      <div v-else-if="!sessions.length" class="empty-state">
        {{ t("chat_no_sessions") }}
      </div>

      <button
        v-for="session in sessions"
        v-else
        :key="session.id"
        type="button"
        class="session"
        :class="{ active: session.id === activeSessionId }"
        @click="handleSelectSession(session.id)"
      >
        <strong>{{ session.title || t("chat_untitled") }}</strong>
        <span>
          {{ session.isDraft
            ? t("chat_draft_label")
            : formatSessionDate(session.updatedAt) }}
        </span>
      </button>
    </aside>

    <!-- ── CHAT AREA ───────────────────────────── -->
    <main class="chat-area">
      <header>
        <div>
          <strong>{{ title }}</strong>
          <p>{{ subtitle }}</p>
        </div>
        <Badge :label="t('chat_rag_active')" />
      </header>

      <div class="messages-wrap">
        <ChatMessages
          :messages="messages"
          :loading="loading || uploading"
        />
      </div>

      <div class="composer-wrap">
        <ChatInput
          :loading="loading || uploading"
          @send="handleSend"
        />
      </div>
    </main>
  </section>
</template>

<style scoped>
.admin-chat {
  height: 100%;
  display: grid;
  grid-template-columns: 256px minmax(0, 1fr);
  overflow: hidden;
  background: var(--bg);
}

.sessions {
  border-right: 1px solid var(--border);
  background: var(--surface);
  padding: 12px;
  overflow-y: auto;
}

.new-session {
  width: 100%;
  background: var(--crimson);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 11px 12px;
  font-weight: 700;
  margin-bottom: 12px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
}

.session {
  width: 100%;
  text-align: left;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 11px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.session.active {
  border-color: var(--crimson);
  background: var(--crimson-dim);
}

.session strong {
  display: block;
  color: var(--tx);
  font-size: 12px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session span {
  color: var(--tx-m);
  font-size: 10px;
}

.empty-state {
  color: var(--tx-m);
  font-size: 12px;
  padding: 14px 8px;
}

.chat-area {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: var(--bg);
}

header {
  padding: 14px 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

header strong {
  display: block;
  font-size: 14px;
  color: var(--tx);
}

header p {
  margin-top: 3px;
  font-size: 11px;
  color: var(--tx-s);
}

.messages-wrap {
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
}

.composer-wrap {
  padding: 14px 18px 18px;
  background: var(--surface);
  border-top: 1px solid var(--border);
}

@media (max-width: 900px) {
  .admin-chat { grid-template-columns: 1fr; }
  .sessions { display: none; }
  .messages-wrap { padding: 18px; }
}
</style>