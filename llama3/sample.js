import * as webllm from "https://esm.run/@mlc-ai/web-llm";

// Callback function to update model loading progress
const initProgressCallback = (initProgress) => {
    console.log(initProgress);
  }
  
const selectedModel = "Llama-3-8B-Instruct-q4f32_1-MLC";
  
const engine = await webllm.CreateMLCEngine(
    selectedModel,
    { initProgressCallback: initProgressCallback }, // engineConfig
);

const messages = [
    { role: "system", content: "You are a helpful AI assistant." },
    { role: "user", content: "Hello, How are you!" },
  ]

const reply = await engine.chat.completions.create({
    messages,
});

console.log(reply.choices[0].message);
console.log(reply.usage);