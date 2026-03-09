import {
  SystemMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { GraphNode } from "@langchain/langgraph";

import { MessagesState } from "../state";

// Import types
import type { TSetupNodeInput } from "./type";

export function setupToolUseNode(input: TSetupNodeInput) {
  const { allToolsByName } = input.llmSetupResult;

  const toolNode: GraphNode<typeof MessagesState> = async (state) => {
    const lastMessage = state.messages.at(-1);

    if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
      return { messages: [] };
    }

    const result: ToolMessage[] = [];
    for (const toolCall of lastMessage.tool_calls ?? []) {
      const tool = allToolsByName.get(toolCall.name);

      if (!tool) {
        result.push(
          new ToolMessage({
            tool_call_id: toolCall.id!,
            content: `Tool "${toolCall.name}" không tồn tại.`,
          }),
        );
        continue;
      }

      const observation = await tool.invoke(toolCall);
      result.push(observation);
    }

    return { messages: result };
  };

  return toolNode;
}
