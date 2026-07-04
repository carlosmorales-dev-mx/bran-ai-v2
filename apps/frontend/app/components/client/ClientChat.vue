<script setup lang="ts">
import { useAuthStore } from "@stores/auth";
import ChatMessages from "@shared/ChatMessages.vue";
import ChatInput from "@shared/ChatInput.vue";
import ConversationHistory from "@client/ConversationHistory.vue";

type SendPayload = {
  text: string;
  files: File[];
};

const auth = useAuthStore();

const assistantTitle = computed(() => {
  return auth.user?.name || "Asistente";
});

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

const historyOpen = ref(false);

onMounted(() => {
  fetchSessions();
});

async function handleSelectSession(sessionId: string) {
  await loadSession(sessionId);
  historyOpen.value = false;
}

function handleNewConversation() {
  newConversation();
  historyOpen.value = false;
}

async function handleSend(payload: SendPayload) {
  if (payload.files.length) {
    await uploadFiles(payload.files, payload.text);
    return;
  }

  await sendMessage(payload.text);
}

function logout() {
  auth.logout();
}
</script>

<template>
  <div class="client-chat">
    <div
      v-if="historyOpen"
      class="mobile-backdrop"
      @click="historyOpen = false"
    />

    <aside class="history-sidebar" :class="{ open: historyOpen }">
      <ConversationHistory
        :sessions="sessions"
        :active-session-id="activeSessionId"
        :loading="loadingHistory"
        @select="handleSelectSession"
        @new="handleNewConversation"
        @logout="logout"
      />
    </aside>

    <section class="chat-shell">
      <div class="chat-top">
        <button class="mobile-menu-btn" type="button" @click="historyOpen = true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <div class="assistant-card">
          <div class="assistant-info">
            <div class="assistant-avatar">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="5" y="7" width="14" height="10" rx="3" stroke="currentColor" stroke-width="1.8" />
                <path d="M9 12H9.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                <path d="M15 12H15.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                <path d="M12 7V4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </div>

            <div>
              <h2>{{ assistantTitle }}</h2>
              <p>
                <span />
                Asistente en línea
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-body">
        <ChatMessages :messages="messages" :loading="loading || uploading" />
      </div>

      <div class="chat-bottom">
        <ChatInput
          :loading="loading || uploading"
          @send="handleSend"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.client-chat {
  height: 100vh;
  width: 100vw;
  background: #f5f7fb;
  padding: 24px;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 22px;
  overflow: hidden;
}

.history-sidebar {
  min-height: 0;
  overflow: hidden;
}

.mobile-backdrop {
  display: none;
}

.chat-shell {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 18px;
}

.chat-top {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
}

.mobile-menu-btn {
  display: none;
}

.assistant-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 16px 18px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.assistant-info {
  display: flex;
  align-items: center;
  gap: 13px;
}

.assistant-avatar {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: #ffe4e6;
  color: #be123c;
  flex-shrink: 0;
}

.assistant-avatar svg {
  width: 22px;
  height: 22px;
}

.assistant-info h2 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.assistant-info p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 7px;
}

.assistant-info p span {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.12);
}

.chat-body {
  min-height: 0;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 26px;
  padding: 24px;
  overflow-y: auto;
}

.chat-bottom {
  min-height: 0;
}

@media (max-width: 1100px) {
  .client-chat {
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 18px;
    padding: 18px;
  }

  .chat-body {
    padding: 18px;
  }
}

@media (max-width: 860px) {
  .client-chat {
    height: 100dvh;
    padding: 12px;
    display: block;
    overflow: hidden;
  }

  .mobile-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 80;
    background: rgba(15, 23, 42, 0.35);
    backdrop-filter: blur(2px);
  }

  .history-sidebar {
    position: fixed;
    z-index: 90;
    inset: 10px auto 10px 10px;
    width: min(84vw, 330px);
    transform: translateX(calc(-100% - 20px));
    transition: transform 0.22s ease;
    overflow: hidden;
  }

  .history-sidebar.open {
    transform: translateX(0);
  }

  .chat-shell {
    height: calc(100dvh - 24px);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: 12px;
  }

  .mobile-menu-btn {
    width: 46px;
    height: 46px;
    border: none;
    border-radius: 15px;
    background: #ffffff;
    color: #be123c;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
    border: 1px solid #e2e8f0;
  }

  .mobile-menu-btn svg {
    width: 22px;
    height: 22px;
  }

  .assistant-card {
    flex: 1;
    min-width: 0;
    padding: 13px 14px;
    border-radius: 18px;
  }

  .assistant-avatar {
    width: 38px;
    height: 38px;
    border-radius: 14px;
  }

  .assistant-info {
    gap: 10px;
  }

  .assistant-info h2 {
    font-size: 15px;
  }

  .assistant-info p {
    font-size: 12px;
  }

  .chat-body {
    min-height: 0;
    border-radius: 20px;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .client-chat {
    padding: 8px;
  }

  .chat-shell {
    height: calc(100dvh - 16px);
    gap: 10px;
  }

  .history-sidebar {
    inset: 8px auto 8px 8px;
    width: min(88vw, 320px);
  }

  .mobile-menu-btn {
    width: 42px;
    height: 42px;
    border-radius: 14px;
  }

  .assistant-card {
    padding: 11px 12px;
  }

  .assistant-avatar {
    width: 34px;
    height: 34px;
    border-radius: 12px;
  }

  .assistant-info h2 {
    font-size: 14px;
  }

  .assistant-info p {
    font-size: 11px;
  }
}
</style>