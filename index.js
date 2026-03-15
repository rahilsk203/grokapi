import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import { Grok } from "./src/core/grok.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;
const API_KEY = process.env.API_KEY || "sk-antigravity-test";

app.use(cors());
app.use(express.json());

const MODEL_MAP = {
    "grok-3": "grok-3-auto",
    "grok-fast": "grok-3-fast",
    "grok-3-fast": "grok-3-fast",
    "grok-4": "grok-4",
    "grok-latest": "grok-4",
    "grok": "grok-3-auto"
};

// Auth Middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};

app.get("/v1/models", authMiddleware, (req, res) => {
    const models = Object.keys(MODEL_MAP).map(id => ({
        id: id,
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "grok"
    }));
    res.json({ object: "list", data: models });
});

app.post("/v1/chat/completions", authMiddleware, async (req, res) => {
    try {
        const { messages, model, stream } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid messages" });
        }

        const lastMessage = messages[messages.length - 1].content;
        const grokModel = MODEL_MAP[model] || "grok-3-auto";
        const grok = new Grok(grokModel);

        if (stream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            try {
                const streamGenerator = await grok.startConvo(lastMessage);
                
                for await (const chunk of streamGenerator) {
                    if (chunk.type === "token") {
                        const sseData = {
                            id: `chatcmpl-${crypto.randomUUID()}`,
                            object: "chat.completion.chunk",
                            created: Math.floor(Date.now() / 1000),
                            model: model,
                            choices: [{
                                delta: { content: chunk.data },
                                index: 0,
                                finish_reason: null
                            }]
                        };
                        res.write(`data: ${JSON.stringify(sseData)}\n\n`);
                    }
                }

                res.write(`data: [DONE]\n\n`);
            } catch (err) {
                res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            } finally {
                res.end();
            }
        } else {
            const streamGenerator = await grok.startConvo(lastMessage);
            let fullText = "";
            let finalData = null;

            for await (const chunk of streamGenerator) {
                if (chunk.type === "token") {
                    fullText += chunk.data;
                } else if (chunk.type === "final") {
                    finalData = chunk.data;
                }
            }

            res.json({
                id: `chatcmpl-${crypto.randomUUID()}`,
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model: model,
                choices: [{
                    message: { role: "assistant", content: fullText || (finalData ? finalData.response : "") },
                    index: 0,
                    finish_reason: "stop"
                }],
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/ask", authMiddleware, async (req, res) => {
    try {
        const grok = new Grok(req.body.model || "grok-3-auto");
        const streamGenerator = await grok.startConvo(req.body.message, req.body.extra_data);
        
        let fullText = "";
        let tokens = [];
        let finalData = null;

        for await (const chunk of streamGenerator) {
            if (chunk.type === "token") {
                fullText += chunk.data;
                tokens.push(chunk.data);
            } else if (chunk.type === "final") {
                finalData = chunk.data;
            }
        }

        res.json({ 
            status: "success", 
            response: fullText || (finalData ? finalData.response : ""),
            stream_response: tokens,
            extra_data: finalData ? finalData.extra_data : null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Grok API Standalone Server listening at http://localhost:${PORT}`);
});
