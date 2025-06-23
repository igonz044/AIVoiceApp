import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

console.log("Starting simple server...");

const app = express();
const port = 3002;

app.use(cors());

app.get("/test", async (req, res) => {
  try {
    console.log("Received test request");
    
    // Test OpenAI first
    console.log("Calling OpenAI...");
    const openaiResponse = await axios.post(
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
    
    const aiText = openaiResponse.data.choices[0].message.content;
    console.log("OpenAI response:", aiText);
    
    // Test ElevenLabs
    console.log("Calling ElevenLabs...");
    const elevenlabsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}/stream`,
      { text: aiText },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );
    
    const audioBase64 = Buffer.from(elevenlabsResponse.data, "binary").toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
    
    console.log("Success! Returning response");
    res.json({ text: aiText, audioUrl });
    
  } catch (error) {
    console.error("Error in test route:", error.message);
    console.error("Error details:", error.response?.status, error.response?.data);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Simple server running at http://localhost:${port}`);
}); 