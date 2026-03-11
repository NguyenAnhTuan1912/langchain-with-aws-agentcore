import { MemorySaver, StateGraph, START, END } from "@langchain/langgraph";

import { setupLLM } from "@/core/llm";

// Import edges
import { setupShouldContinueConditionalEdge } from "./edge";

// Import nodes
import { setupLLMCallNode, setupToolUseNode } from "./node";

import { MessagesState } from "./state";

export async function createAgent() {
  const llmSetupResult = await setupLLM();
  const [llmCallNode, toolNode, shouldContinue] = await Promise.all([
    setupLLMCallNode({ llmSetupResult: llmSetupResult }),
    setupToolUseNode({ llmSetupResult: llmSetupResult }),
    setupShouldContinueConditionalEdge(),
  ]);

  const checkpointer = new MemorySaver();

  const builder = new StateGraph(MessagesState)
    .addNode("llmCall", llmCallNode)
    .addNode("toolNode", toolNode)
    .addEdge(START, "llmCall")
    .addConditionalEdges("llmCall", shouldContinue, ["toolNode", END])
    .addEdge("toolNode", "llmCall");

  const agent = builder.compile({ checkpointer });

  return agent;
}
