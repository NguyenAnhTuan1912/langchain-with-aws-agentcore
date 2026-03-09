import {
  SystemMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { GraphNode } from "@langchain/langgraph";

import { MessagesState } from "../state";

// Import types
import type { TSetupNodeInput } from "./type";

export async function setupLLMCallNode(input: TSetupNodeInput) {
  const { llm } = input.llmSetupResult;

  const llmCall: GraphNode<typeof MessagesState> = async (state) => {
    return {
      messages: [
        await llm.invoke([
          new SystemMessage(
            "You are a helpful assistant tasked with performing arithmetic on a set of inputs.",
          ),
          ...state.messages,
        ]),
      ],
      llmCalls: 1,
    };
  };

  return llmCall;
}
