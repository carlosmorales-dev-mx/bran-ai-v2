<script setup lang="ts">
import Logo from "@shared/Logo.vue";
import { useAuthStore } from "@stores/auth";
import { usePreviewStore } from "@stores/preview";

const auth    = useAuthStore();
const preview = usePreviewStore();
const { t }   = useT();
const route   = useRoute();

const navItems = computed(() => [
  { label: t("nav_panel"),     to: "/admin",           icon: "dashboard" },
  { label: t("nav_knowledge"), to: "/admin/knowledge", icon: "knowledge" },
  { label: t("nav_sessions"),  to: "/admin/chat",      icon: "sessions"  },
]);

function isActive(to: string) {
  if (to === "/admin") return route.path === "/admin";
  return route.path.startsWith(to);
}

async function logout() {
  auth.clearAuth();
  await navigateTo("/login");
}
</script>

<template>
  <aside class="sidebar">
    <div class="brand"><Logo /></div>

    <div class="workspace">
      <span class="workspace-icon">{{ auth.user?.name?.charAt(0)?.toUpperCase() || "A" }}</span>
      <span class="workspace-text">
        <strong>{{ auth.user?.name || "Admin" }}</strong>
        <small>{{ auth.user?.email || "" }}</small>
      </span>
    </div>

    <nav>
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ active: isActive(item.to) }"
      >
        <span class="nav-icon">
          <!-- Dashboard -->
          <svg v-if="item.icon === 'dashboard'" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/>
          </svg>
          <!-- Knowledge -->
          <svg v-else-if="item.icon === 'knowledge'" viewBox="0 0 20 20" fill="none">
            <ellipse cx="10" cy="6" rx="7" ry="3" stroke="currentColor" stroke-width="1.6"/>
            <path d="M3 6v4c0 1.657 3.134 3 7 3s7-1.343 7-3V6" stroke="currentColor" stroke-width="1.6"/>
            <path d="M3 10v4c0 1.657 3.134 3 7 3s7-1.343 7-3v-4" stroke="currentColor" stroke-width="1.6"/>
          </svg>
          <!-- Sessions -->
          <svg v-else viewBox="0 0 20 20" fill="none">
            <path d="M17 11.5a1.5 1.5 0 0 1-1.5 1.5H5.5l-3 3V4.5A1.5 1.5 0 0 1 4 3h11.5A1.5 1.5 0 0 1 17 4.5v7z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 7.5h8M6 10.5h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="nav-label">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="footer">
      <div class="lang-switch">
        <button type="button" :class="{ active: preview.lang === 'en' }" @click="preview.setLang('en')">EN</button>
        <button type="button" :class="{ active: preview.lang === 'es' }" @click="preview.setLang('es')">ES</button>
      </div>

      <div class="user-card">
        <div class="avatar">{{ auth.user?.name?.charAt(0) || "A" }}</div>
        <div class="user-info">
          <strong>{{ auth.user?.name || "Admin" }}</strong>
          <span>{{ auth.user?.email || "admin" }}</span>
        </div>
      </div>

      <button class="logout-btn" type="button" @click="logout">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M7 15l-4-5 4-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 10h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M11 3h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        {{ t("nav_logout") }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 224px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.brand { padding: 18px 16px 14px; }

/* ── Workspace ──────────────────────── */
.workspace {
  margin: 0 10px 14px;
  padding: 10px 11px;
  border: 1px solid var(--border);
  background: #f7f8fe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.workspace-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: linear-gradient(135deg, var(--blue-mid), var(--blue));
  color: white;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(45, 91, 227, 0.22);
}
.workspace-text { flex: 1; min-width: 0; }
.workspace-text strong {
  display: block;
  font-size: 12px;
  color: var(--tx);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
  line-height: 1.3;
}
.workspace-text small {
  display: block;
  font-size: 10px;
  color: var(--tx-m);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

/* ── Nav ────────────────────────────── */
nav {
  flex: 1;
  padding: 8px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-link {
  min-height: 40px;
  padding: 9px 10px;
  border-radius: 10px;
  color: var(--tx-s);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.15s ease;
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  background: #f0f2fa;
  color: var(--tx);
}

.nav-link.active {
  background: var(--crimson-dim);
  color: var(--crimson);
  font-weight: 700;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.nav-icon svg {
  width: 17px;
  height: 17px;
}

.nav-label { flex: 1; line-height: 1.2; }

/* ── Footer ─────────────────────────── */
.footer {
  border-top: 1px solid var(--border);
  padding: 10px;
  display: grid;
  gap: 8px;
}

.lang-switch {
  padding: 3px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  border-radius: 10px;
  background: #f2f4fb;
}
.lang-switch button {
  border: none;
  background: transparent;
  color: var(--tx-m);
  border-radius: 8px;
  height: 30px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
}
.lang-switch button.active {
  background: white;
  color: var(--tx);
  box-shadow: var(--shadow);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 11px;
  background: var(--bg);
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--crimson), var(--blue));
  display: grid;
  place-items: center;
  color: white;
  font-weight: 800;
  flex-shrink: 0;
  font-size: 12px;
}
.user-info { min-width: 0; }
.user-info strong {
  display: block;
  color: var(--tx);
  font-size: 12px;
  line-height: 1.3;
  font-weight: 700;
}
.user-info span {
  display: block;
  color: var(--tx-m);
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  width: 100%;
  border: 1px solid var(--border);
  background: white;
  color: var(--tx-s);
  border-radius: 11px;
  padding: 9px 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
}
.logout-btn svg { width: 17px; height: 17px; }
.logout-btn:hover {
  color: var(--crimson);
  border-color: #fecdd3;
  background: #fff1f2;
}
</style>