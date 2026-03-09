import {
  StateSchema,
  MessagesValue,
  GraphNode,
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";

const State = new StateSchema({
  messages: MessagesValue,
});

const mockLlm: GraphNode<typeof State> = (state) => {
  return {
    messages: [
      { role: "ai", content: "Hello, this is an example of LangGraph" },
    ],
  };
};

const graph = new StateGraph(State)
  .addNode("mock_llm", mockLlm)
  .addEdge(START, "mock_llm")
  .addEdge("mock_llm", END)
  .compile();

async function main() {
  return await graph.invoke({ messages: [{ role: "user", content: "hi!" }] });
}

main().then(console.log).catch(console.error);
