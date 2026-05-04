# AI Chatbot Frontend

Next.js 14 frontend for the AI Chatbot Backend with liquid glass UI design.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** icons
- **Sora** display font · **DM Sans** body font
- Liquid glass design system (backdrop-filter + layered transparency)

## Getting Started

### Prerequisites

Make sure the backend services are running:
```bash
# From the full_project/ root
docker compose up
```

### Install & Run

```bash
cd chatbot-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment

`.env.local` is pre-configured for local Docker Compose:
```env
NEXT_PUBLIC_AUTH_URL=http://localhost:8001
NEXT_PUBLIC_CHAT_URL=http://localhost:8000
```

Change these if your services run on different ports.

## Features

| Feature | Description |
|---|---|
| 🔐 Auth | Register + login with JWT via auth gateway |
| 💬 Chat | Full message thread with memory |
| ⚡ Streaming | SSE token-by-token streaming toggle |
| 📋 Sidebar | Conversation history with timestamps |
| 🎨 Liquid Glass | Full backdrop-blur glass design system |
| 📱 Responsive | Works on desktop and mobile |

## Pages

- `/` — Auth page or Chat app (auto-detected from JWT)

## Build for Production

```bash
npm run build
npm start
```
