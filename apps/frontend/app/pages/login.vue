<script setup lang="ts">
import Logo from "@shared/Logo.vue";
import Spinner from "@shared/Spinner.vue";
import { useAuthStore } from "@stores/auth";

definePageMeta({
  middleware: "guest",
});

const auth = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");

const features = [
  {
    icon: "🧠",
    text: "RAG sobre PDF, video, imagen, URL y texto",
  },
  {
    icon: "💬",
    text: "Chat por sesión con trazabilidad completa",
  },
  {
    icon: "📊",
    text: "Dashboard de tokens, costos y latencia",
  },
  {
    icon: "🔐",
    text: "Roles separados para administrador y cliente",
  },
];

const nodes = [
  { x: "12%", y: "18%", r: 5, o: 0.6 },
  { x: "88%", y: "12%", r: 8, o: 0.4 },
  { x: "6%", y: "72%", r: 4, o: 0.5 },
  { x: "94%", y: "68%", r: 6, o: 0.35 },
  { x: "50%", y: "8%", r: 3, o: 0.4 },
  { x: "22%", y: "88%", r: 7, o: 0.3 },
  { x: "78%", y: "90%", r: 4, o: 0.45 },
  { x: "35%", y: "5%", r: 2, o: 0.5 },
];

async function submit() {
  error.value = "";

  if (!email.value.trim()) {
    error.value = "Correo requerido";
    return;
  }

  if (!password.value.trim()) {
    error.value = "Contraseña requerida";
    return;
  }

  try {
    const user = await auth.login(email.value, password.value);

    if (!user) {
      error.value = "No se pudo cargar el usuario";
      return;
    }

    if (user.role === "ADMIN") {
      await navigateTo("/admin");
      return;
    }

    await navigateTo("/chat");
  } catch (err: any) {
    error.value = err.message || "Credenciales inválidas";
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="brand-panel">
      <svg class="geo" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
        <line x1="0" y1="300" x2="600" y2="100" />
        <line x1="0" y1="500" x2="600" y2="300" />
        <line x1="0" y1="700" x2="600" y2="500" />
        <line x1="200" y1="0" x2="200" y2="900" />
        <line x1="400" y1="0" x2="400" y2="900" />
        <circle cx="300" cy="450" r="200" />
        <circle cx="300" cy="450" r="120" />
        <circle cx="300" cy="450" r="40" />
      </svg>

      <span
        v-for="(node, index) in nodes"
        :key="index"
        class="floating-node"
        :style="{
          left: node.x,
          top: node.y,
          width: `${node.r * 2}px`,
          height: `${node.r * 2}px`,
          opacity: node.o,
          animationDelay: `${index * 0.3}s`,
          animationDuration: `${3 + index * 0.4}s`,
        }"
      />

      <div class="brand-top">
        <Logo white />
      </div>

      <div class="brand-copy">
        <div class="hero-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="white" opacity="0.3" />
            <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" stroke-width="1.5" />
            <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" fill="white" opacity="0.6" />
          </svg>
        </div>

        <h1>
          El cerebro central<br />
          de tu IA empresarial.
        </h1>

        <p>
          Plataforma con RAG, sesiones conversacionales y monitoreo de consumo en tiempo real.
        </p>

        <div class="features">
          <div
            v-for="(feature, index) in features"
            :key="feature.text"
            class="feature"
            :style="{ animationDelay: `${0.1 + index * 0.08}s` }"
          >
            <span>{{ feature.icon }}</span>
            <p>{{ feature.text }}</p>
          </div>
        </div>
      </div>

      <p class="brand-foot">
        v1.4.2 · Acapulco, MX · © 2026 Bran.ai
      </p>
    </section>

    <section class="form-panel">
      <form class="auth-card" @submit.prevent="submit">
        <h2>Bienvenido de nuevo 👋</h2>
        <p>Ingresa tus credenciales para continuar</p>

        <label>
          Correo electrónico
          <input
            v-model="email"
            type="email"
            placeholder="correo@empresa.com"
            autocomplete="email"
          />
        </label>

        <label>
          Contraseña
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </label>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <button class="submit" type="submit" :disabled="auth.loading">
          <Spinner v-if="auth.loading" />
          <span>{{ auth.loading ? "Autenticando..." : "Iniciar sesión →" }}</span>
        </button>

        <div class="forgot">
          <span>¿Olvidaste tu contraseña?</span>
          <button type="button">Recuperar</button>
        </div>

        <div class="create">
          <span>¿Aún no tienes cuenta?</span>
          <NuxtLink to="/register">Crear una</NuxtLink>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100dvh;
  width: 100vw;
  display: flex;
  overflow: hidden;
}

.brand-panel {
  width: 45%;
  flex-shrink: 0;
  background: linear-gradient(150deg, #7f0a1e 0%, var(--crimson) 45%, #e03258 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 52px;
  position: relative;
  overflow: hidden;
}

.geo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.08;
}

.geo line,
.geo circle {
  stroke: white;
  stroke-width: 1;
  fill: none;
}

.floating-node {
  position: absolute;
  border-radius: 999px;
  background: white;
  animation-name: float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.brand-top,
.brand-copy,
.brand-foot {
  position: relative;
  z-index: 1;
}

.hero-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: grid;
  place-items: center;
  margin-bottom: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.brand-copy h1 {
  font-size: 34px;
  font-weight: 700;
  color: white;
  line-height: 1.18;
  letter-spacing: -0.03em;
  margin-bottom: 18px;
}

.brand-copy > p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.75;
  max-width: 360px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 36px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 12px;
  animation: fadeUp 0.4s ease both;
}

.feature span {
  font-size: 16px;
}

.feature p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.78);
  font-weight: 400;
}

.brand-foot {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.form-panel {
  flex: 1;
  display: grid;
  place-items: center;
  background: #fafbff;
  padding: 40px;
  overflow-y: auto;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  animation: fadeUp 0.35s ease both;
}

.auth-card h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--tx);
  margin-bottom: 6px;
}

.auth-card > p {
  font-size: 13px;
  color: var(--tx-s);
  margin-bottom: 24px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--tx-s);
  font-weight: 500;
  margin-bottom: 14px;
}

input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 9px;
  padding: 12px 14px;
  color: var(--tx);
  font-size: 14px;
  outline: none;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.error {
  color: var(--crimson);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.submit {
  width: 100%;
  background: var(--crimson);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 13px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  gap: 9px;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 18px var(--crimson-glow);
  margin-top: 4px;
  transition: opacity 0.15s, transform 0.1s;
}

.submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

.submit:disabled {
  opacity: 0.8;
  cursor: default;
}

.forgot,
.create {
  text-align: center;
  margin-top: 14px;
  font-size: 13px;
  color: var(--tx-s);
}

.forgot button,
.create a {
  border: none;
  background: transparent;
  color: var(--crimson);
  font-weight: 600;
  margin-left: 4px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 980px) {
  .auth-page {
    flex-direction: column;
    overflow-y: auto;
  }

  .brand-panel {
    width: 100%;
    min-height: 420px;
    padding: 36px;
  }

  .brand-copy h1 {
    font-size: 30px;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 720px;
  }

  .form-panel {
    min-height: 520px;
  }
}

@media (max-width: 560px) {
  .brand-panel {
    min-height: 360px;
    padding: 24px;
  }

  .hero-icon {
    width: 54px;
    height: 54px;
    border-radius: 14px;
    margin-bottom: 22px;
  }

  .brand-copy h1 {
    font-size: 25px;
  }

  .brand-copy > p {
    font-size: 13px;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 22px;
  }

  .feature p {
    font-size: 12px;
  }

  .brand-foot {
    margin-top: 24px;
  }

  .form-panel {
    padding: 26px 18px;
    min-height: auto;
  }

  .auth-card h2 {
    font-size: 22px;
  }
}
</style>