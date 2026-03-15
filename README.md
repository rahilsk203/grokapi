# 🚀 Grok API Standalone (Node.js)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-v18%2B-blue.svg)](https://nodejs.org/)

A professional, standalone Node.js Express server that acts as a proxy for Grok API requests. This project provides an OpenAI-compatible interface, making it easy to integrate Grok into your existing AI workflows, tools, and applications.

---

## ✨ Key Features

- **⚡️ Real-Time Streaming:** Full support for Server-Sent Events (SSE) using Async Generators for low-latency token delivery.
- **🤖 OpenAI Specification:** Drop-in compatibility for `/v1/chat/completions` and `/v1/models` endpoints.
- **🛡️ Secure Access:** Built-in API Key authentication to protect your proxy.
- **📦 Lightweight & Fast:** Optimized with Node.js and Express for high performance and low resource consumption.
- **🔄 Model Mapping:** Transparently maps OpenAI model names to Grok's native models.

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- **Node.js**: version 18 or higher.
- **npm**: (comes with Node.js).

### 2. Clone and Install
```bash
git clone https://github.com/your-repo/grok-api-standalone.git
cd grok-api-standalone
npm install
```

### 3. Configuration
Create a `.env` file in the root directory and configure your settings:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `API_KEY` | Your custom secret key for accessing this proxy | `sk-antigravity-test` |
| `PORT` | The port the server will listen on | `8787` |

Example `.env`:
```env
API_KEY=your-super-secret-key
PORT=8787
```

### 4. Start the Server
```bash
# Start in production mode
npm start

# Start in development mode (if nodemon is configured)
# npm run dev
```

---

## 🚀 API Usage

### 1. List Available Models
**Endpoint:** `GET /v1/models`

```bash
curl http://localhost:8787/v1/models \
  -H "Authorization: Bearer your-secret-key"
```

### 2. Chat Completions (OpenAI Format)
**Endpoint:** `POST /v1/chat/completions`

Supports both streaming and non-streaming responses.

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-antigravity-test" \
  -d '{
    "model": "grok-latest",
    "messages": [{"role": "user", "content": "Tell me a joke about programming."}],
    "stream": false
  }'
```

### 3. Native Ask Endpoint
**Endpoint:** `POST /ask`

A simplified endpoint for direct interaction.

```bash
curl http://localhost:8787/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-antigravity-test" \
  -d '{
    "message": "What is the capital of France?",
    "model": "grok-3-fast"
  }'
```

---

## 🗺️ Model Mapping

The proxy maps standard model names to Grok equivalents:

| Input Model | Grok Backend |
| :--- | :--- |
| `grok-latest` | `grok-4` |
| `grok-3` | `grok-3-auto` |
| `grok-fast` | `grok-3-fast` |
| `grok-4` | `grok-4` |

---

## 📜 Disclaimer & License

**Disclaimer:** This project is an unofficial proxy and is not affiliated with xAI or Grok. It is intended for educational purposes and personal use only. Please respect the terms of service of the underlying services.

**License:** Distributed under the MIT License. See `LICENSE` for more information.

---
<p align="center">Made with ❤️ for the AI community</p>