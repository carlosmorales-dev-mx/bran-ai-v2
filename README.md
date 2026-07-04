# bran.ai v2 🤖

Sistema de helpdesk con IA conversacional (RAG) multi-usuario. Combina un frontend moderno, un backend de orquestación robusto y un motor de IA independiente para dar soporte inteligente basado en documentación propia de cada organización.

> Proyecto personal desarrollado como parte de mi portafolio como Desarrollador Backend Jr. Construido con asistencia de IA (workflow AI-assisted development), con foco en arquitectura, integración de servicios y product-building.

## 🧠 ¿Qué hace?

bran.ai v2 permite a una organización subir su documentación interna y ofrecer a sus usuarios (o clientes) un asistente conversacional que responde preguntas basándose **únicamente en esa documentación**, usando RAG (Retrieval-Augmented Generation) en lugar de depender del conocimiento general del modelo.

- Autenticación y gestión de usuarios por rol
- Ingesta y vectorización de documentos
- Búsqueda semántica sobre la base de conocimiento (ChromaDB)
- Generación de respuestas contextualizadas vía DeepSeek API
- Interfaz multi-usuario con soporte i18n (ES/EN)

## 🏗️ Arquitectura

El proyecto está organizado como un **monorepo** con tres servicios independientes que se comunican entre sí:

```
bran.ai v2/
├── apps/
│   ├── frontend/        # Nuxt 4 — interfaz de usuario
│   ├── backend-core/    # NestJS — auth, usuarios, orquestación
│   └── backend-ai/      # FastAPI — RAG, ChromaDB, DeepSeek API
```

**¿Por qué separar el backend en dos servicios?**
`backend-core` (NestJS) se encarga de todo lo transaccional: autenticación, usuarios, roles y persistencia. `backend-ai` (FastAPI) es un microservicio especializado en el pipeline de IA (embeddings, retrieval, generación), aislado para poder escalarlo o reemplazarlo sin tocar el resto del sistema.

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | Nuxt 4, Vue 3, Pinia |
| Backend de orquestación | NestJS |
| Backend de IA | FastAPI (Python) |
| Vector store | ChromaDB |
| Modelo de lenguaje | DeepSeek API |
| Gestor de paquetes | pnpm (workspace) |
| Entorno Python | uv |

## 🚀 Cómo correrlo localmente

### Requisitos previos
- Node.js 20+
- pnpm
- Python 3.11+ y [uv](https://github.com/astral-sh/uv)
- Una API key de [DeepSeek](https://platform.deepseek.com/)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/carlosmorales-dev-mx/bran-ai-v2.git
cd bran-ai-v2

# Instalar dependencias del workspace (frontend + backend-core)
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus propias credenciales
```

### Backend AI (FastAPI)

```bash
cd apps/backend-ai
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Backend Core (NestJS)

```bash
cd apps/backend-core
pnpm run start:dev
```

### Frontend (Nuxt 4)

```bash
cd apps/frontend
pnpm run dev
```

## 📸 Capturas

_(Agregar screenshots del dashboard, el chat, o un GIF corto del flujo de uso)_

## 📌 Estado del proyecto

Proyecto en desarrollo activo. Próximas mejoras planeadas:
- [ ] Tests automatizados (backend-core y backend-ai)
- [ ] Dockerización completa del stack
- [ ] Panel de analíticas de uso por organización

## 👤 Autor

**Carlos Morales Sandoval**
Desarrollador Backend Jr · Python & Node.js · Sistemas RAG / IA aplicada

- Portafolio: [cmorales.dev](https://cmorales.dev)
- GitHub: [@carlosmorales-dev-mx](https://github.com/carlosmorales-dev-mx)
- Email: carlosmorales.dev.mx@gmail.com

## 📄 Licencia

Este proyecto es de uso personal/portafolio. Si quieres usar parte del código, contáctame primero.