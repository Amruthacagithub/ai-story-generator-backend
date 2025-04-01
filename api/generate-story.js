// api/generate-story.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config(); // Load environment variables

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

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { prompt } = req.body;

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await model.generateContent(prompt);
            const story = result.response.candidates[0].content.parts[0].text;

            const choices = await generateChoices(story);

            res.status(200).json({ story, choices });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to generate story" });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
