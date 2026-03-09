import { HumanMessage } from "@langchain/core/messages";
import { BedrockAgentCoreApp } from "bedrock-agentcore/runtime";

import { createAgent } from "@/agent-graph";

async function main() {
  const agent = await createAgent();

  const app = new BedrockAgentCoreApp({
    invocationHandler: {
      process: async (payload: any, context) => {
        const prompt =
          payload?.input?.prompt ??
          payload?.input ??
          payload?.prompt ??
          "Hello!";

        console.log(`Session ${context.sessionId} - Received prompt:`, prompt);

        const result = await agent.invoke({
          messages: [new HumanMessage(prompt)],
        });

        const last = result.messages[result.messages.length - 1];

        return {
          output: {
            text: last.content,
          },
        };
      },
    },
  });

  app.run();
}

main();
