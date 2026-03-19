# LangGraph with Amazon Bedrock AgentCore

AI Agent được xây dựng bằng [LangGraph](https://langchain-ai.github.io/langgraphjs/) và [Amazon Bedrock](https://aws.amazon.com/bedrock/), có thể deploy lên [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) Runtime.

## Tổng quan

Project sử dụng LangGraph để xây dựng một Agent graph với các thành phần:

- **LLM Call Node** — Gọi model Claude trên Amazon Bedrock thông qua `ChatBedrockConverse`
- **Tool Use Node** — Thực thi tool calls từ LLM (ví dụ: lấy ngày giờ, giá vàng)
- **Conditional Edge** — Quyết định tiếp tục gọi tool hay trả kết quả cho user

```
START → llmCall → (có tool call?) → toolNode → llmCall → ... → END
```

Agent được serve qua Express server với endpoint `/invocations`, tương thích với AgentCore Runtime.

## Tech Stack

- TypeScript + esbuild
- LangGraph / LangChain
- Amazon Bedrock (Claude)
- Express
- Docker (deploy lên AgentCore)

## Yêu cầu

- Node.js >= 18
- pnpm
- AWS credentials đã cấu hình (profile hoặc environment variables)
- Quyền truy cập Amazon Bedrock model

## Cài đặt

```bash
# Clone repo
git clone <repo-url>
cd langchain-with-aws-agentcore

# Cài dependencies
pnpm install

# Tạo file .env
cp .env.example .env
```

Cấu hình `.env`:

```env
AWS_REGION=ap-southeast-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_EMBEDDING_MODEL_ID=cohere.embed-multilingual-v3
AWS_PROFILE=

# Chỉ cần khi deploy lên AgentCore
AGENTCORE_RUNTIME_ARN=
```

## Chạy local

```bash
# Build
pnpm build:dev

# Start server (port 8080)
pnpm start

# Chat với agent qua terminal
pnpm start:localchat
```

## Deploy lên AgentCore

```bash
# Build Docker image
docker build -t langchain-agentcore .

# Push lên ECR và deploy theo hướng dẫn AgentCore
```

Sau khi deploy, dùng script `call-remote.js` để test:

```bash
node scripts/call-remote.js
```

## Cấu trúc project

```
├── app.ts                          # Express server + /invocations endpoint
├── src/
│   ├── config.ts                   # Cấu hình (model, features, MCP servers)
│   ├── core/
│   │   └── llm.ts                  # Setup LLM + bind tools
│   ├── agent-graph/
│   │   ├── index.ts                # Tạo LangGraph agent
│   │   ├── state/                  # Graph state definition
│   │   ├── node/                   # LLM call + Tool use nodes
│   │   └── edge/                   # Conditional edges
│   └── tools/                      # Custom tools (datetime, gold price, ...)
├── scripts/
│   ├── call-local.js               # Chat local qua terminal
│   ├── call-remote.js              # Chat với AgentCore Runtime
│   ├── build-dev.mjs               # Build dev
│   └── build-prod.mjs             # Build production
├── Dockerfile                      # Docker image cho AgentCore
└── .env.example                    # Template biến môi trường
```

## Tuỳ chỉnh

### Thêm tool mới

Tạo file trong `src/tools/`, sau đó đăng ký trong `src/tools/index.ts`:

```typescript
// src/tools/my-tool.ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const myTool = tool(
  async ({ param }) => {
    return "result";
  },
  {
    name: "my_tool",
    description: "Mô tả tool",
    schema: z.object({ param: z.string() }),
  },
);
```

### Cấu hình features

Trong `src/config.ts` có thể bật/tắt:

- `TOOL_USE_FEATURE` — Bật/tắt tool calling
- `LONG_TERM_MEM_FEATURE` — Bật/tắt long-term memory
- `RESPONSE_STREAMING_FEATURE` — Bật/tắt streaming
- `MCP_SERVERS` — Danh sách MCP servers kết nối
