const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST(req, res) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      systemInstruction: systemInstruction,
    });

    const data = await req.json();
    console.log('Received message:', data);

    const chat = model.startChat({
      history: data.messages.map(message => ({
        role: message.role,
        parts: message.parts
      })),
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 100,
      },
    });

    const result = await chat.sendMessage("");
    const response = await result.response;
    const text = await response.text();
    console.log('AI response:', text);

    res.status(200).json({
      role: "model",
      parts: [{ text: text }],
    });
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}