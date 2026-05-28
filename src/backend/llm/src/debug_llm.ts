import Anthropic from "@anthropic-ai/sdk";

export function debugLLMResponse(llmResponse: Anthropic.Messages.Message): void {
  console.log("\n========= DEBUG LLM RESPONSE =========");
  
  // Métadonnées générales
  console.log("model       :", llmResponse.model);
  console.log("stop_reason :", llmResponse.stop_reason);
  console.log("stop_seq    :", llmResponse.stop_sequence);
  
  // Tokens et cache
  console.log("\n--- usage ---");
  console.log("input tokens        :", llmResponse.usage.input_tokens);
  console.log("output tokens       :", llmResponse.usage.output_tokens);
  console.log("cache read tokens   :", llmResponse.usage.cache_read_input_tokens ?? 0);
  console.log("cache write tokens  :", llmResponse.usage.cache_creation_input_tokens ?? 0);

  // Contenu bloc par bloc
  console.log("\n--- content blocks :", llmResponse.content.length, "---");
  llmResponse.content.forEach((block, index) => {
    console.log(`\nbloc [${index}] type : ${block.type}`);

    if (block.type === "text") {
      console.log("text :", block.text);

    } else if (block.type === "tool_use") {
      console.log("tool name  :", block.name);
      console.log("tool id    :", block.id);
      console.log("tool input :", JSON.stringify(block.input, null, 2));

    } else if (block.type === "thinking") {
      console.log("thinking :", block.thinking.slice(0, 100) + "..."); // tronqué
    
    } else {
      // Type inconnu — affiche tout brut
      console.log("raw :", JSON.stringify(block, null, 2));
    }
  });

  console.log("=======================================\n");
}