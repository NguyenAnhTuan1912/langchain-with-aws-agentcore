import readline from "readline";

async function main() {
  let isProcessing = true;
  let sessionId = "test-session-01";

  try {
    const rl = readline.promises.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    while (isProcessing) {
      const userInput = await rl.question("User: ");

      const url = "http://localhost:8080/invocations";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          input: {
            prompt: userInput,
          },
        }),
      });

      const data = await res.json();
      const aiResponse = data.output.text;
      console.log("Bot:", aiResponse);
      console.log();
    }
  } catch (error) {
    throw error;
  }
}

main().catch(console.error);
