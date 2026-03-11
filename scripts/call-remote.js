import readline from "readline";
import { randomUUID } from "node:crypto";

import dotenv from "dotenv";
import {
  BedrockAgentCoreClient,
  InvokeAgentRuntimeCommand,
} from "@aws-sdk/client-bedrock-agentcore";

dotenv.config();

async function main() {
  let isProcessing = true;
  let sessionId = randomUUID();

  try {
    const rl = readline.promises.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("Session ID:", sessionId);
    console.log();

    while (isProcessing) {
      const userInput = await rl.question("User: ");

      const client = new BedrockAgentCoreClient({
        region: process.env.AWS_REGION || "ap-southeast-1",
      });

      const input = {
        runtimeSessionId: sessionId,
        agentRuntimeArn: process.env.AGENTCORE_RUNTIME_ARN,
        qualifier: "DEFAULT",
        payload: Buffer.from(JSON.stringify({ prompt: userInput })),
      };

      const command = new InvokeAgentRuntimeCommand(input);
      const response = await client.send(command);
      const textResponse = await response.response.transformToString();
      const data = JSON.parse(textResponse);
      const aiResponse = data.output.text;

      console.log("Bot:", aiResponse);
      console.log();
    }
  } catch (error) {
    isProcessing = false;
    throw error;
  }
}

main().catch(console.error);
