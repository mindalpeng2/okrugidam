export default async function handler(req, res) {
    if (req.method === 'POST') {
      // POST 요청 처리
      const { message } = req.body;
  
      // Google AI Studio 챗봇 API 호출, GOOGLE_AI_STUDIO_CHATBOT_API_URL을 실제 google ai 스튜디오 챗봇 api url로 바꿔야 되는데
      // 이를 어디에서 확인할 수 있는지 모르겠음, 배포가 완료되지 않아서 확인이 어려운 것이 아닌가 생각 
      // Vertex ai(유료)로 deploy를 하는 게 맞는지 고민 중
      const response = await fetch('GOOGLE_AI_STUDIO_CHATBOT_API_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 필요한 경우 인증 토큰 등의 헤더 추가
        },
        body: JSON.stringify({ message }),
      });
  
      const data = await response.json();
  
      // 챗봇 응답을 클라이언트에게 반환
      res.status(200).json({ text: data.text });
    } else {
      // 허용되지 않은 HTTP 메서드에 대한 처리
      res.status(405).json({ error: 'Method not allowed' });
    }
  }