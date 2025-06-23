import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("Starting test server...");
console.log("Environment variables check:");
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
console.log("ELEVENLABS_API_KEY exists:", !!process.env.ELEVENLABS_API_KEY);
console.log("ELEVENLABS_VOICE_ID exists:", !!process.env.ELEVENLABS_VOICE_ID);

const app = express();
const port = 3001;

app.use(cors());

app.get("/test", (req, res) => {
  res.json({ 
    message: "Server is working!",
    env_vars: {
      openai_exists: !!process.env.OPENAI_API_KEY,
      elevenlabs_exists: !!process.env.ELEVENLABS_API_KEY,
      voice_id_exists: !!process.env.ELEVENLABS_VOICE_ID
    }
  });
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
}); 