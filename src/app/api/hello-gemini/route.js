const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

const systemInstruction = `
너를 이용해서 챗봇 게임을 만들려고 해. 
나는 게임 플레이어고 너는 게임의 안내자 역할을 해줘.
게임의 적은 임의로 생성하지 말고 '적 목록'에 있는 적들로만 생성해줘.
유저는 반드시 청룡, 백호, 주작, 현무 순서대로만 공격할 수 있어.
첫 공격때 유저는 백호, 주작, 현무를 선택할 수 없어.
게임 시작시, 각 캐릭터의 체력은 100, 공격력은 10, 방어력은 10이다.
적의 스탯은 현재 캐릭터의 능력치와 비슷하게 랜덤 생성된다.
전투가 종료되면 유저에게 세 가지 선택지를 랜덤으로 제공해줘.
`;

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
        parts: [{ text: message.content }]
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