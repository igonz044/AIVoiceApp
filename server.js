import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Debug environment variables
console.log("Environment variables check:");
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
console.log("ELEVENLABS_API_KEY exists:", !!process.env.ELEVENLABS_API_KEY);
console.log("ELEVENLABS_VOICE_ID exists:", !!process.env.ELEVENLABS_VOICE_ID);
console.log("ELEVENLABS_VOICE_ID value:", process.env.ELEVENLABS_VOICE_ID);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/api/generate", async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    // Check if required environment variables are set
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set in environment variables" });
    }
    
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "ELEVENLABS_API_KEY is not set in environment variables" });
    }
    
    if (!process.env.ELEVENLABS_VOICE_ID) {
      return res.status(500).json({ error: "ELEVENLABS_VOICE_ID is not set in environment variables" });
    }

    console.log("Starting API calls...");
    const aiResponse = await getAIResponse(prompt);
    const audioUrl = await getAudioUrl(aiResponse);

    res.json({ text: aiResponse, audioUrl });
  } catch (err) {
    console.error("Error in /api/generate:", err.message);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function getAIResponse(prompt) {
  try {
    console.log("Calling OpenAI API...");
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("OpenAI API call successful");
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error.response?.status, error.response?.data, error.stack);
    throw error;
  }
}

async function getAudioUrl(text) {
  try {
    console.log("Calling ElevenLabs API...");
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}/stream`,
      { text },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );
    console.log("ElevenLabs API call successful");
    const audioBase64 = Buffer.from(response.data, "binary").toString("base64");
    return `data:audio/mpeg;base64,${audioBase64}`;
  } catch (error) {
    console.error("ElevenLabs API error:", error.response?.status, error.response?.data, error.stack);
    throw error;
  }
}
