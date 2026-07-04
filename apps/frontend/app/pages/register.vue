<script setup lang="ts">
import Logo from "@shared/Logo.vue";
import Spinner from "@shared/Spinner.vue";
import { useAuthStore } from "@stores/auth";

definePageMeta({
  middleware: "guest",
});

const auth = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");

async function submit() {
  error.value = "";

  if (!name.value.trim()) {
    error.value = "Nombre requerido";
    return;
  }

  if (!email.value.trim()) {
    error.value = "Correo requerido";
    return;
  }

  if (!email.value.includes("@")) {
    error.value = "Correo inválido";
    return;
  }

  if (password.value.length < 6) {
    error.value = "La contraseña debe tener mínimo 6 caracteres";
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = "Las contraseñas no coinciden";
    return;
  }

  try {
    const user = await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });

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
    error.value = err.message || "No se pudo crear la cuenta";
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="brand-panel">
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
          Crea tu espacio<br />
          de IA empresarial.
        </h1>

        <p>
          Registra tu cuenta para empezar a usar Bran.ai con RAG, sesiones y monitoreo de consumo.
        </p>
      </div>

      <p class="brand-foot">
        v1.4.2 · Acapulco, MX · © 2026 Bran.ai
      </p>
    </section>

    <section class="form-panel">
      <form class="auth-card" @submit.prevent="submit">
        <h2>Crea tu cuenta</h2>
        <p>Completa tus datos para continuar</p>

        <label>
          Nombre completo
          <input
            v-model="name"
            type="text"
            placeholder="Carlos Martínez"
            autocomplete="name"
          />
        </label>

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
            autocomplete="new-password"
          />
        </label>

        <label>
          Confirmar contraseña
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
          />
        </label>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <button class="submit" type="submit" :disabled="auth.loading">
          <Spinner v-if="auth.loading" />
          <span>{{ auth.loading ? "Creando cuenta..." : "Crear cuenta →" }}</span>
        </button>

        <div class="create">
          <span>¿Ya tienes cuenta?</span>
          <NuxtLink to="/login">Iniciar sesión</NuxtLink>
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
}

.submit:disabled {
  opacity: 0.8;
  cursor: default;
}

.create {
  text-align: center;
  margin-top: 14px;
  font-size: 13px;
  color: var(--tx-s);
}

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
    min-height: 340px;
    padding: 36px;
  }

  .brand-copy h1 {
    font-size: 30px;
  }

  .form-panel {
    min-height: 620px;
  }
}

@media (max-width: 560px) {
  .brand-panel {
    min-height: 300px;
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

  .form-panel {
    padding: 26px 18px;
  }

  .auth-card h2 {
    font-size: 22px;
  }
}
</style>