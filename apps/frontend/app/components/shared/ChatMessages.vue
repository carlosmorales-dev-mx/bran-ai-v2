<script setup lang="ts">
import RoleAvatar from "@shared/RoleAvatar.vue";
import Spinner from "@shared/Spinner.vue";

const { t } = useT();

type ChatAttachment = {
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
};

defineProps<{
  messages: {
    id?: string;
    role: "user" | "assistant";
    content: string;
    createdAt?: string;
    attachments?: ChatAttachment[];
  }[];
  loading?: boolean;
}>();

function formatFileSize(size: number) {
  if (size < 1024)           return `${size} B`;
  if (size < 1024 * 1024)    return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/"))                        return "🖼️";
  if (type.startsWith("video/"))                        return "🎬";
  if (type.includes("pdf"))                             return "📄";
  if (type.includes("spreadsheet") || type.includes("excel")) return "📊";
  if (type.includes("word"))                            return "📝";
  return "📎";
}
</script>

<template>
  <div class="chat-messages">
    <div
      v-for="(message, index) in messages"
      :key="message.id || `${message.role}-${index}`"
      class="message-row"
      :class="message.role"
    >
      <RoleAvatar :role="message.role" />

      <div class="message-body">
        <div class="message-meta">
          <span class="message-role">
            {{ message.role === "assistant" ? t("chat_assistant") : t("chat_user") }}
          </span>
        </div>

        <div class="message-bubble" :class="message.role">
          <!-- attachments -->
          <div v-if="message.attachments?.length" class="attachments">
            <div
              v-for="(attachment, i) in message.attachments"
              :key="`${attachment.name}-${i}`"
              class="attachment-card"
              :class="{ image: attachment.previewUrl }"
            >
              <img
                v-if="attachment.previewUrl"
                :src="attachment.previewUrl"
                :alt="attachment.name"
                class="attachment-image"
              />
              <div v-else class="attachment-icon">
                {{ getFileIcon(attachment.type) }}
              </div>
              <div class="attachment-info">
                <span class="attachment-name">{{ attachment.name }}</span>
                <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
              </div>
            </div>
          </div>

          <!-- text -->
          <div v-if="message.content" class="message-text">
            {{ message.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- typing indicator -->
    <div v-if="loading" class="message-row assistant">
      <RoleAvatar role="assistant" />
      <div class="message-body">
        <div class="message-meta">
          <span class="message-role">{{ t("chat_assistant") }}</span>
        </div>
        <div class="message-bubble assistant typing-bubble">
          <Spinner />
          <span>{{ t("chat_typing") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.message-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-row.user {
  flex-direction: row-reverse;
}

.message-body {
  max-width: min(75%, 760px);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.message-row.user .message-body {
  align-items: flex-end;
}

.message-meta {
  font-size: 12px;
  color: #64748b;
}

.message-role {
  font-weight: 600;
}

.message-bubble {
  border-radius: 18px;
  padding: 14px 16px;
  line-height: 1.55;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.message-bubble.assistant {
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.message-bubble.user {
  background: linear-gradient(135deg, #e11d48, #be123c);
  color: #ffffff;
}

.message-text {
  margin-top: 8px;
}

.message-text:first-child {
  margin-top: 0;
}

.attachments {
  display: grid;
  gap: 8px;
}

.attachment-card {
  min-width: 220px;
  max-width: 320px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 14px;
  padding: 8px;
}

.message-bubble.assistant .attachment-card {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.attachment-card.image {
  align-items: flex-start;
}

.attachment-image {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 12px;
  background: #f8fafc;
  flex-shrink: 0;
}

.attachment-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.22);
  font-size: 20px;
  flex-shrink: 0;
}

.message-bubble.assistant .attachment-icon {
  background: #e2e8f0;
}

.attachment-info {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.attachment-name {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-size {
  font-size: 11px;
  opacity: 0.85;
}

.typing-bubble {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 860px) {
  .message-body { max-width: min(84%, 720px); }
}

@media (max-width: 560px) {
  .chat-messages { gap: 14px; }
  .message-row   { gap: 8px; }
  .message-body  { max-width: 86%; }
  .message-meta  { font-size: 11px; }

  .message-bubble {
    font-size: 13px;
    padding: 12px 13px;
    border-radius: 16px;
  }

  .attachment-card  { min-width: 190px; max-width: 250px; }
  .attachment-image { width: 60px; height: 60px; }
}

@media (max-width: 390px) {
  .message-body   { max-width: 88%; }
  .message-bubble { font-size: 12.5px; }
}
</style>