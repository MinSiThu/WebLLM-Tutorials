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


const template = (prompt)=>{
    return [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: prompt },
      ]
}

const answer_template = (prompt,answer)=>{
    return ` <div class="message sent">
            <div class="message-content">
                <p>${prompt}</p>
            </div>
        </div>

        <div class="message received">
            <div class="message-content">
                <p>${answer}</p>
            </div>
        </div>`
}
  
async function llm(prompt){
    const prompt_template = template(prompt)
    const reply = await engine.chat.completions.create({
        messages:prompt_template,
    });

    return reply;
}

async function renderAnswer(prompt,reply){
    const answer_html = answer_template(prompt,reply.choices[0].message.content);
    chatContainer.innerHTML += answer_html;
}

async function toggleSendButton(){
    sendButton.disabled = !sendButton.disabled;
}

const sendButton = document.getElementById("send");
const promptInput = document.getElementById("prompt");
const chatContainer = document.getElementById("chatContainer")

sendButton.addEventListener("click",async ()=>{
    toggleSendButton();
    const prompt = promptInput.value;

    const reply = await llm(prompt);

    await renderAnswer(prompt,reply);
    toggleSendButton();
})

