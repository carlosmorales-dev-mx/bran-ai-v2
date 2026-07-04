#!/usr/bin/env bash
# ================================================================
# BRAN.AI v2 — Full Audit Dump
# Ejecutar desde: bran.ai v2/   (raíz del proyecto, un nivel arriba de apps/)
# Output: debug_bran_audit.txt
# ================================================================
OUT="debug_bran_audit.txt"

dump_file() {
  local file="$1"
  local range="$2"
  {
    echo ""
    echo "============================================================"
    echo "FILE: $file"
    echo "RANGE: $range"
    echo "============================================================"
    echo ""
  } >> "$OUT"
  if [ -f "$file" ]; then
    sed -n "$range" "$file" >> "$OUT"
  else
    echo "[NO EXISTE] $file" >> "$OUT"
  fi
  echo "" >> "$OUT"
}

: > "$OUT"
echo "Iniciando audit dump → $OUT"

# ──────────────────────────────────────────────
# FRONTEND — CONFIG & ENTRY
# ──────────────────────────────────────────────
dump_file "apps/frontend/nuxt.config.ts"                  "1,300p"
dump_file "apps/frontend/app/app.vue"                     "1,80p"
dump_file "apps/frontend/app/assets/css/main.css"         "1,600p"

# ──────────────────────────────────────────────
# FRONTEND — LAYOUTS
# ──────────────────────────────────────────────
dump_file "apps/frontend/app/layouts/admin.vue"           "1,400p"
dump_file "apps/frontend/app/layouts/client.vue"          "1,300p"
dump_file "apps/frontend/app/layouts/default.vue"         "1,200p"

# ──────────────────────────────────────────────
# FRONTEND — ADMIN COMPONENTS
# ──────────────────────────────────────────────
dump_file "apps/frontend/app/components/admin/AdminSidebar.vue"    "1,600p"
dump_file "apps/frontend/app/components/admin/Topbar.vue"          "1,400p"
dump_file "apps/frontend/app/components/admin/DashboardPanel.vue"  "1,800p"
dump_file "apps/frontend/app/components/admin/KnowledgePanel.vue"  "1,800p"
dump_file "apps/frontend/app/components/admin/AdminChatPanel.vue"  "1,800p"
dump_file "apps/frontend/app/components/admin/UploadBox.vue"       "1,800p"
dump_file "apps/frontend/app/components/admin/SessionsList.vue"    "1,400p"

# ──────────────────────────────────────────────
# FRONTEND — CLIENT COMPONENTS
# ──────────────────────────────────────────────
dump_file "apps/frontend/app/components/client/ClientChat.vue"           "1,500p"
dump_file "apps/frontend/app/components/client/ConversationHistory.vue"  "1,400p"

# ──────────────────────────────────────────────
# FRONTEND — SHARED COMPONENTS
# ──────────────────────────────────────────────
dump_file "apps/frontend/app/components/shared/StatCard.vue"     "1,300p"
dump_file "apps/frontend/app/components/shared/BarChart.vue"     "1,400p"
dump_file "apps/frontend/app/components/shared/Badge.vue"        "1,200p"
dump_file "apps/frontend/app/components/shared/Spark.vue"        "1,200p"
dump_file "apps/frontend/app/components/shared/ChatInput.vue"    "1,300p"
dump_file "apps/frontend/app/components/shared/ChatMessages.vue" "1,400p"
dump_file "apps/frontend/app/components/shared/Field.vue"        "1,200p"
dump_file "apps/frontend/app/components/shared/FileTypeIcon.vue" "1,200p"
dump_file "apps/frontend/app/components/shared/Logo.vue"         "1,200p"
dump_file "apps/frontend/app/components/shared/RoleAvatar.vue"   "1,200p"
dump_file "apps/frontend/app/components/shared/Spinner.vue"      "1,150p"

# ──────────────────────────────────────────────
# FRONTEND — PAGES
# ──────────────────────────────────────────────
dump_file "apps/frontend/app/pages/index.vue"            "1,200p"
dump_file "apps/frontend/app/pages/login.vue"            "1,300p"
dump_file "apps/frontend/app/pages/register.vue"         "1,300p"
dump_file "apps/frontend/app/pages/chat.vue"             "1,300p"
dump_file "apps/frontend/app/pages/admin/index.vue"      "1,250p"
dump_file "apps/frontend/app/pages/admin/knowledge.vue"  "1,250p"
dump_file "apps/frontend/app/pages/admin/chat.vue"       "1,250p"

# ──────────────────────────────────────────────
# FRONTEND — STORES & COMPOSABLES
# ──────────────────────────────────────────────
dump_file "apps/frontend/app/stores/auth.ts"         "1,400p"
dump_file "apps/frontend/app/stores/preview.ts"      "1,200p"
dump_file "apps/frontend/app/composables/useApi.ts"  "1,350p"
dump_file "apps/frontend/app/composables/useChat.ts" "1,350p"

# ──────────────────────────────────────────────
# FRONTEND — MIDDLEWARE & PLUGINS
# ──────────────────────────────────────────────
dump_file "apps/frontend/app/middleware/admin.ts"              "1,60p"
dump_file "apps/frontend/app/middleware/auth.ts"               "1,60p"
dump_file "apps/frontend/app/middleware/client.ts"             "1,60p"
dump_file "apps/frontend/app/middleware/guest.ts"              "1,60p"
dump_file "apps/frontend/app/plugins/auth-guard.client.ts"     "1,80p"

# ──────────────────────────────────────────────
# FRONTEND — CONSTANTS
# ──────────────────────────────────────────────
dump_file "apps/frontend/app/constants/colors.ts"   "1,100p"
dump_file "apps/frontend/app/constants/mock.ts"     "1,150p"

# ──────────────────────────────────────────────
# BACKEND — CONFIG & MAIN
# ──────────────────────────────────────────────
dump_file "apps/backend/src/main.ts"        "1,80p"
dump_file "apps/backend/src/app.module.ts"  "1,100p"
dump_file "apps/backend/package.json"       "1,60p"

# ──────────────────────────────────────────────
# BACKEND — AUTH
# ──────────────────────────────────────────────
dump_file "apps/backend/src/auth/auth.controller.ts"     "1,120p"
dump_file "apps/backend/src/auth/auth.service.ts"        "1,200p"
dump_file "apps/backend/src/auth/auth.module.ts"         "1,80p"
dump_file "apps/backend/src/auth/jwt.guard.ts"           "1,60p"
dump_file "apps/backend/src/auth/jwt.strategy.ts"        "1,80p"
dump_file "apps/backend/src/auth/dto/login.dto.ts"       "1,40p"
dump_file "apps/backend/src/auth/dto/register.dto.ts"    "1,40p"

# ──────────────────────────────────────────────
# BACKEND — CHAT
# ──────────────────────────────────────────────
dump_file "apps/backend/src/chat/chat.controller.ts"  "1,150p"
dump_file "apps/backend/src/chat/chat.service.ts"     "1,300p"
dump_file "apps/backend/src/chat/chat.module.ts"      "1,60p"

# ──────────────────────────────────────────────
# BACKEND — KNOWLEDGE
# ──────────────────────────────────────────────
dump_file "apps/backend/src/knowledge/knowledge.controller.ts"   "1,150p"
dump_file "apps/backend/src/knowledge/knowledge.service.ts"      "1,400p"
dump_file "apps/backend/src/knowledge/knowledge.module.ts"       "1,60p"
dump_file "apps/backend/src/knowledge/dto/ingest.dto.ts"         "1,60p"
dump_file "apps/backend/src/knowledge/dto/ingest-url.dto.ts"     "1,60p"

# ──────────────────────────────────────────────
# BACKEND — METRICS
# ──────────────────────────────────────────────
dump_file "apps/backend/src/metrics/metrics.controller.ts"        "1,150p"
dump_file "apps/backend/src/metrics/metrics.service.ts"           "1,500p"
dump_file "apps/backend/src/metrics/metrics.module.ts"            "1,60p"
dump_file "apps/backend/src/metrics/dto/summary.dto.ts"           "1,80p"
dump_file "apps/backend/src/metrics/dto/daily-metrics.dto.ts"     "1,80p"
dump_file "apps/backend/src/metrics/dto/session-metrics.dto.ts"   "1,80p"

# ──────────────────────────────────────────────
# BACKEND — COMMON
# ──────────────────────────────────────────────
dump_file "apps/backend/src/common/utils/pricing.util.ts"               "1,120p"
dump_file "apps/backend/src/common/decorators/roles.decorator.ts"       "1,40p"
dump_file "apps/backend/src/common/decorators/user.decorator.ts"        "1,40p"
dump_file "apps/backend/src/common/guards/roles.guard.ts"               "1,60p"
dump_file "apps/backend/src/common/filters/http-exception.filter.ts"    "1,60p"
dump_file "apps/backend/src/common/interceptors/response.interceptor.ts" "1,60p"
dump_file "apps/backend/src/common/middleware/logger.middleware.ts"      "1,60p"
dump_file "apps/backend/src/common/types/jwt-user.type.ts"              "1,30p"

# ──────────────────────────────────────────────
# BACKEND — RAG PROXY & PRISMA
# ──────────────────────────────────────────────
dump_file "apps/backend/src/rag-proxy/rag-proxy.service.ts"  "1,150p"
dump_file "apps/backend/src/rag-proxy/rag-proxy.module.ts"   "1,40p"
dump_file "apps/backend/src/prisma/prisma.service.ts"        "1,60p"
dump_file "apps/backend/src/prisma/prisma.module.ts"         "1,40p"
dump_file "apps/backend/prisma/schema.prisma"                "1,500p"

# ──────────────────────────────────────────────
# RAG — PYTHON SERVICE
# ──────────────────────────────────────────────
dump_file "apps/rag/main.py"                    "1,120p"
dump_file "apps/rag/core/config.py"             "1,80p"
dump_file "apps/rag/routers/health.py"          "1,60p"
dump_file "apps/rag/routers/ingest.py"          "1,200p"
dump_file "apps/rag/routers/query.py"           "1,200p"
dump_file "apps/rag/routers/metrics.py"         "1,200p"
dump_file "apps/rag/parsers/file_parser.py"     "1,200p"
dump_file "apps/rag/services/cache.py"          "1,150p"
dump_file "apps/rag/services/chunker.py"        "1,150p"
dump_file "apps/rag/services/embedder.py"       "1,150p"
dump_file "apps/rag/services/retriever.py"      "1,200p"
dump_file "apps/rag/services/llm/llm.py"        "1,150p"
dump_file "apps/rag/services/llm/gemini.py"     "1,200p"
dump_file "apps/rag/services/llm/deepseek.py"   "1,200p"
dump_file "apps/rag/services/llm/rules.py"      "1,200p"
dump_file "apps/rag/pyproject.toml"             "1,60p"

# ──────────────────────────────────────────────
# INFRA
# ──────────────────────────────────────────────
dump_file "docker-compose.yml"  "1,60p"
dump_file ".env.example"        "1,60p"

echo ""
echo "✅ Audit dump completo → $OUT"
echo "   $(wc -l < "$OUT") líneas exportadas"