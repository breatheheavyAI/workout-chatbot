require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
    try {
        console.log("📩 Received a request!");

        if (!req.body || !req.body.message) {
            console.error("❌ No message received!");
            return res.status(400).json({ error: "No message provided in request body." });
        }

        const userMessage = req.body.message;
        console.log("User Message:", userMessage);

        if (!process.env.OPENAI_API_KEY) {
            console.error("❌ Missing OpenAI API Key!");
            return res.status(500).json({ error: "OpenAI API key is not set." });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a fitness assistant that gives workout recommendations based on user input." },
                { role: "user", content: userMessage },
            ],
        });

        console.log("✅ OpenAI API Response:", JSON.stringify(response, null, 2));

        if (!response || !response.choices || response.choices.length === 0) {
            console.error("⚠️ Unexpected OpenAI Response:", JSON.stringify(response, null, 2));
            return res.status(500).json({ error: "Unexpected response from OpenAI." });
        }

        const botReply = response.choices[0].message.content;
        console.log("🤖 Bot Reply:", botReply);

        res.json({ reply: botReply });

    } catch (error) {
        console.error("🚨 OpenAI API Call Failed:", error.response ? error.response.data : error.message);
        res.status(500).json({
            error: "OpenAI API call failed.",
            details: error.response ? error.response.data : error.message
        });
    }
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
