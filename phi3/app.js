// Streaming

import * as webllm from "https://esm.run/@mlc-ai/web-llm";

// Callback function to update model loading progress
const initProgressCallback = (initProgress) => {
    console.log(initProgress);
}
  
const selectedModel = "Phi-3-mini-4k-instruct-q4f32_1-MLC";
  
const engine = await webllm.CreateMLCEngine(
    selectedModel,
    { initProgressCallback: initProgressCallback }, // engineConfig
);

const messages = [
    { role: "system", content: "You are a helpful AI assistant." },
    { role: "user", content: "Hello, How are you?" },
]

const chunks = await engine.chat.completions.create({
    messages,
    stream:true,
    stream_options: { include_usage: true },
});

let reply = "";
for await (const chunk of chunks) {
    reply += chunk.choices[0]?.delta.content || "";
    console.log(reply);
    if (chunk.usage) {
      console.log(chunk.usage); // only last chunk has usage
    }
}
  
const fullReply = await engine.getMessage();
console.log(fullReply);