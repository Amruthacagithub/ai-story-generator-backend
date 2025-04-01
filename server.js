const express = require("express");
const cors = require("cors");
const axios = require("axios"); 
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateChoices(story) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Based on the following story, provide three possible choices for what happens next. 
    The choices should be concise and engaging.

    Story: "${story}"

    Choices:
    1.`;

    const result = await model.generateContent(prompt);
    const choicesText = result.response.candidates[0].content.parts[0].text;

    const choices = choicesText.split("\n").map((choice) => choice.replace(/^\d+\.\s*/, "").trim());
    return choices.filter((c) => c.length > 0);
}


app.post("/generate-story", async (req, res) => {
    try {
        const { prompt, } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const result = await model.generateContent(prompt);
        const story = result.response.candidates[0].content.parts[0].text;

        const choices = await generateChoices(story);

        res.json({ story, choices});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate story" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
