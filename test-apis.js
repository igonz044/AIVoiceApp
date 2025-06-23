import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

console.log("Testing APIs...");

// Test OpenAI API
async function testOpenAI() {
  try {
    console.log("Testing OpenAI API...");
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello" }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ OpenAI API works!");
    return true;
  } catch (error) {
    console.error("❌ OpenAI API failed:", error.response?.status, error.response?.data);
    return false;
  }
}

// Test ElevenLabs API
async function testElevenLabs() {
  try {
    console.log("Testing ElevenLabs API...");
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}/stream`,
      { text: "Hello" },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );
    console.log("✅ ElevenLabs API works!");
    return true;
  } catch (error) {
    console.error("❌ ElevenLabs API failed:", error.response?.status, error.response?.data);
    return false;
  }
}

async function runTests() {
  const openaiWorks = await testOpenAI();
  const elevenlabsWorks = await testElevenLabs();
  
  console.log("\nResults:");
  console.log("OpenAI:", openaiWorks ? "✅" : "❌");
  console.log("ElevenLabs:", elevenlabsWorks ? "✅" : "❌");
}

runTests(); 