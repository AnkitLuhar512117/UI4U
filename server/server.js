const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(express.json());

const apiKey = AIzaSyAKkQVDBjXJzO5wSHJPSeVR_rzop7No6QA;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Endpoint to generate UI code
app.post("/generate-ui", async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    const chatSession = await model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              text: `${userPrompt} List UI component. Provide the code in three distinct sections: HTML, CSS, and JavaScript. Ensure the code is self-contained and functional, without any additional explanation or context`, // Use the user prompt here
            },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage("generate");
    const generatedCode = result.response.text();

    // Validate response
    if (!generatedCode) {
      return res
        .status(500)
        .json({ error: "No valid response from Gemini API" });
    }

    res.json({ code: generatedCode });
  } catch (error) {
    console.error("Error generating code:", error.message || error);
    res.status(500).json({ error: error.message || error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
