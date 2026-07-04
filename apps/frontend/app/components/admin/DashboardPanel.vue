<script setup lang="ts">
const { t } = useT();
const { success, error: toastError } = useToast();

type Summary = { scope?: "GLOBAL"|"USER"; totalUsers?: number; totalTokens: number; totalCost: number; totalSessions: number; avgLatencyMs: number };
type DailyMetric = { date: string; tokens: number; input: number; output: number };
type SessionMetric = { id: string; title: string; messages: number; tokensIn: number; tokensOut: number; totalTokens: number; cost: number; avgLatencyMs?: number; createdAt: string; updatedAt?: string; user?: { id: string; name: string; email: string; role: string } };

const { request } = useApi();
const loading = ref(true);
const summary = ref<Summary>({ totalUsers: 0, totalTokens: 0, totalCost: 0, totalSessions: 0, avgLatencyMs: 0 });
const daily   = ref<DailyMetric[]>([]);
const sessions = ref<SessionMetric[]>([]);

const chartValues = computed(() => {
  if (!daily.value.length) return Array.from({ length: 30 }, () => 0);
  return daily.value.slice(-30).map(i => i.tokens || 0);
});
const chartLabels = computed(() => {
  const rows = daily.value.slice(-30);
  if (!rows.length) return ["Apr 1", "Apr 29"];
  return rows.map(i => formatShortDate(i.date));
});
const sparkValues = computed(() => {
  const v = chartValues.value.filter(v => v > 0);
  return v.length >= 2 ? v.slice(-10) : [1,2,3,4,6,8,11,13,15,18];
});
const topCostSessions = computed(() => [...sessions.value].sort((a,b) => b.cost - a.cost).slice(0,6));
const recentSessions  = computed(() => sessions.value.slice(0,8));
const subtitle = computed(() => summary.value.scope === "GLOBAL" ? t("dash_subtitle_global") : t("dash_subtitle_user"));

function fmt(v: number) { return new Intl.NumberFormat("es-MX").format(v||0); }
function fmtCompact(v: number) {
  const n = Number(v||0);
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(1)}K`;
  return fmt(n);
}
function fmtMoney(v: number) { return `$${Number(v||0).toFixed(4)}`; }
function formatShortDate(v: string) {
  if (!v) return "";
  return new Intl.DateTimeFormat("en-US", { month:"short", day:"numeric" }).format(new Date(v));
}
function formatTime(v?: string) {
  if (!v) return "";
  return new Intl.DateTimeFormat("es-MX", { hour:"2-digit", minute:"2-digit" }).format(new Date(v));
}
function projectName(s: SessionMetric) { return s.user?.name || s.user?.email || "Usuario"; }
function maxCost() { return Math.max(...topCostSessions.value.map(s => s.cost), 0.000001); }

async function loadDashboard() {
  loading.value = true;
  try {
    const [s, d, se] = await Promise.all([
      request<Summary>("/metrics/summary"),
      request<DailyMetric[]>("/metrics/daily"),
      request<SessionMetric[]>("/metrics/sessions"),
    ]);
    summary.value  = s;
    daily.value    = d || [];
    sessions.value = se || [];
  } catch (err: any) {
    toastError(err?.message || "No pude cargar métricas.");
  } finally { loading.value = false; }
}

onMounted(loadDashboard);
</script>

<template>
  <section class="dashboard">
    <div class="heading">
      <div>
        <h1>{{ t("dash_title") }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      <button type="button" :disabled="loading" @click="loadDashboard">
        <span v-if="loading" class="btn-spinner" />
        {{ loading ? t("dash_refreshing") : t("dash_refresh") }}
      </button>
    </div>

    <!-- skeleton grid -->
    <div v-if="loading" class="grid">
      <div v-for="n in 4" :key="n" class="stat-skeleton">
        <div class="sk sk-label" /><div class="sk sk-value" /><div class="sk sk-trend" />
      </div>
    </div>

    <div v-else class="grid">
      <StatCard :label="t('dash_tokens')" :value="fmtCompact(summary.totalTokens)" :trend="t('dash_trend_usage')" tone="crimson" :values="sparkValues" />
      <StatCard :label="t('dash_cost')" :value="fmtMoney(summary.totalCost)" :trend="t('dash_trend_estimated')" tone="yellow" :values="sparkValues" />
      <StatCard :label="t('dash_sessions')" :value="fmt(summary.totalSessions)" :trend="t('dash_trend_chats')" tone="blue" :values="sparkValues" />
      <StatCard :label="t('dash_latency')" :value="`${summary.avgLatencyMs||0}ms`" :trend="t('dash_trend_avg')" tone="green" :values="[18,17,15,16,14,13,12,11,10,9]" />
    </div>

    <div class="cards">
      <article class="tokens-card">
        <div class="card-head">
          <h2>{{ t("dash_token_day") }}</h2>
          <span>{{ fmtMoney(summary.totalCost) }} total · {{ fmtCompact(summary.totalTokens) }} tokens</span>
        </div>
        <BarChart :values="chartValues" :labels="chartLabels" />
      </article>

      <article class="cost-card">
        <h2>{{ t("dash_cost_chat") }}</h2>
        <div v-if="!topCostSessions.length" class="empty">{{ t("dash_no_sessions") }}</div>
        <div v-else class="cost-list">
          <div v-for="s in topCostSessions" :key="s.id" class="cost-row">
            <div class="cost-meta"><span>{{ s.title }}</span><b>{{ fmtMoney(s.cost) }}</b></div>
            <div class="track"><i :style="{ width: `${Math.max(8, Math.round((s.cost/maxCost())*100))}%` }" /></div>
          </div>
        </div>
      </article>
    </div>

    <article class="recent-card">
      <div class="card-head">
        <h2>{{ t("dash_recent") }}</h2>
        <Badge label="LIVE" />
      </div>
      <div v-if="!recentSessions.length" class="empty pad">{{ t("dash_no_recent") }}</div>
      <div v-else class="table">
        <div class="table-head">
          <span>{{ t("col_session") }}</span><span>{{ t("col_user") }}</span>
          <span>{{ t("col_tokens_in") }}</span><span>{{ t("col_tokens_out") }}</span>
          <span>{{ t("col_cost") }}</span><span>{{ t("col_time") }}</span>
        </div>
        <div v-for="s in recentSessions" :key="s.id" class="table-row">
          <strong>{{ s.title }}</strong><span>{{ projectName(s) }}</span>
          <span>{{ fmt(s.tokensIn) }}</span><span>{{ fmt(s.tokensOut) }}</span>
          <b>{{ fmtMoney(s.cost) }}</b><span>{{ formatTime(s.updatedAt||s.createdAt) }}</span>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
.dashboard{height:100%;overflow-y:auto;padding:28px 32px}
.heading{margin-bottom:24px;display:flex;justify-content:space-between;gap:16px;align-items:center}
h1{font-size:24px;margin-bottom:4px}
p{color:var(--tx-s);font-size:13px}
button{border:none;background:var(--crimson);color:white;border-radius:10px;padding:11px 16px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;font-family:inherit;font-size:13px;transition:opacity 0.15s}
button:disabled{opacity:0.55;cursor:not-allowed}
.btn-spinner{width:13px;height:13px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:999px;display:inline-block;animation:spin 0.7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
.stat-skeleton{min-height:142px;background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:20px 22px;display:flex;flex-direction:column;gap:16px}
.sk{background:linear-gradient(90deg,#f0f2fa 25%,#e4e8f5 50%,#f0f2fa 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:7px}
.sk-label{height:10px;width:60%}
.sk-value{height:28px;width:45%}
.sk-trend{height:10px;width:35%}
@keyframes shimmer{to{background-position:-200% 0}}
.cards{display:grid;grid-template-columns:1.6fr 1fr;gap:14px;margin-bottom:22px}
article{background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:20px 22px;box-shadow:var(--shadow)}
.card-head{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:16px}
h2{font-size:13px;font-weight:700}
.card-head span{color:var(--tx-m);font-size:12px}
.empty{color:var(--tx-m);font-size:13px}
.empty.pad{padding:16px 0}
.cost-list{display:grid;gap:13px}
.cost-row{display:grid;gap:6px}
.cost-meta{display:flex;justify-content:space-between;gap:12px}
.cost-meta span{color:var(--tx-s);font-size:12px;max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cost-meta b{color:var(--tx-s);font-size:12px;font-family:var(--mono)}
.track{height:4px;border-radius:999px;background:#e8ecf8;overflow:hidden}
.track i{display:block;height:100%;border-radius:inherit;background:var(--crimson);transition:width 0.4s ease}
.cost-row:nth-child(2) .track i{background:var(--blue)}
.cost-row:nth-child(3) .track i{background:var(--yellow)}
.cost-row:nth-child(4) .track i{background:var(--green)}
.recent-card{padding:0;overflow:hidden}
.recent-card .card-head{padding:20px 22px 16px;margin:0;border-bottom:1px solid var(--border)}
.table{display:grid}
.table-head,.table-row{display:grid;grid-template-columns:1.7fr 1.35fr 0.7fr 0.7fr 0.6fr 0.55fr;gap:14px;align-items:center}
.table-head{padding:12px 18px;background:var(--card-alt);border-bottom:1px solid var(--border)}
.table-head span{color:var(--tx-m);font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:800}
.table-row{padding:13px 18px;border-bottom:1px solid var(--border)}
.table-row:last-child{border-bottom:none}
.table-row strong{color:var(--tx);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.table-row span{color:var(--tx-s);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.table-row b{color:var(--yellow);font-size:12px;font-family:var(--mono)}
@media(max-width:1200px){.grid{grid-template-columns:repeat(2,1fr)}.cards{grid-template-columns:1fr}.table-head,.table-row{grid-template-columns:1.4fr 1fr 0.7fr 0.7fr}.table-head span:nth-child(n+5),.table-row span:nth-child(n+5),.table-row b{display:none}}
@media(max-width:720px){.dashboard{padding:20px}.grid{grid-template-columns:1fr}.heading{align-items:flex-start;flex-direction:column}.table-head,.table-row{grid-template-columns:1fr 0.7fr}.table-head span:nth-child(n+3),.table-row span:nth-child(n+3),.table-row b{display:none}}
</style>