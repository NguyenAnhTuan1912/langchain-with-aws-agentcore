import express, { Request, Response } from "express";
import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "@/agent-graph";

async function main() {
  const app = express();
  const host = process.env.HOST || "0.0.0.0";
  const port = process.env.PORT || 8080;

  // Middleware để parse JSON từ request body
  app.use(express.json());
  // Hỗ trợ cả binary payload nếu script call-remote gửi Buffer
  app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }));

  const agent = await createAgent();

  app.get("/", (req, res) => res.status(200).send("OK"));
  app.get("/health", (req, res) => res.status(200).send("OK"));
  app.get("/ping", (req, res) => res.status(200).send("OK"));

  app.post("/invocations", async (req: Request, res: Response) => {
    try {
      let payload = req.body;

      if (Buffer.isBuffer(req.body)) {
        try {
          payload = JSON.parse(req.body.toString());
        } catch (e) {
          payload = { prompt: req.body.toString() };
        }
      }

      const prompt =
        payload?.input?.prompt ?? payload?.prompt ?? payload?.input ?? "Hello!";

      const sessionId =
        (req.headers["x-runtime-session-id"] as string) || "default-session";

      console.log(
        `[${new Date().toISOString()}] Session ${sessionId} - Received:`,
        prompt,
      );

      const result = await agent.invoke(
        {
          messages: [new HumanMessage(prompt)],
        },
        { configurable: { thread_id: sessionId } },
      );

      const lastMessage = result.messages[result.messages.length - 1];

      return res.status(200).json({
        output: {
          text: lastMessage.content,
        },
      });
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(Number(port), host, () => {
    console.log(
      `🚀 AgentCore Express Server listening on http://${host}:${port}`,
    );
    console.log(`✅ Health check available at /`);
    console.log(`✅ Health check available at /health`);
    console.log(`✅ Health check available at /ping`);
  });
}

main().catch(console.error);
