const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

/*
  System Prompt 설정
  이 설정에 따라 AI 의 대답의 유형을 다르게 만들 수 있음
  단, 이 설정을 항상 확실히 참조하지는 않음
  이 설정은 메시지 목록의 첫 번째 메시지로 사용됨
*/
const systemInstruction =
    "너를 이용해서 챗봇 게임을 만들려고 해.  \n\n나는 게임 플레이어고 너는 게임의 안내자 역할을 해줘. 게임이 시작되면 게임 플레이 방법과 각 사신수의 공격과 필살기에 대한 정보를 간단하게 유저에게 알려줘. 체력말고 각 필살기의 특징만 설명해줘,\n\n게임의 적은 임의로 생성하지 말고 '적 목록'에 있는 적들로만 생성해줘.\n유저는 공격할 캐릭터의 순서를 선택할 수 있어\n 그러나 유저의 턴에서는 한번 사용한 캐릭터를 또 사용할 수 없어. 반드시 청룡, 백호, 주작, 현무가 한 번씩만 공격하고 턴이 끝나야해. 같은 캐릭터를 연속으로 사용할 수 없어. \n 게임이 시작될 때 적 목록은 유저에게 설명해줄 필요 없어. \n\n게임 방식: \n유저는 청룡, 백호, 주작, 현무 네 명의 캐릭터를 이용해서 하나의 적에게 공격할 수 있다. \n각각의 캐릭터에게 '공격', '필살기' 등의 명령어로 지시할 수 있다.\n캐릭터, '공격' 또는 공격이 들어간 채팅을 입력하면 해당 캐릭터가 적에게 공격한다.\n'필살기' 또는 필살기가 들어간 채팅을 입력하면 해당 캐릭터가 적에게 특수공격을 발동한다.\n적을 공격하면 적이 입은 데미지를 표시한다.\n4명의 캐릭터가 턴을 마치면 적이 4명의 캐릭터에게 동시에 공격한다.\n같은 캐릭터를 연속으로 선택하지 못하게 한다. \n같은 캐릭터를 연속으로 선택할 경우 아직 회복하지 못해서 능력을 사용하지 못한다고 언급한다.\n\n캐릭터의 능력치에는 체력, 공격력, 방어력 세 가지가 있고 적을 이길 때마다 조금씩 상승한다.\n게임 시작시, 각 캐릭터의 체력은 100, 공격력은 10, 방어력은 10이다.\n적의 스탯은 현재 캐릭터의 능력치와 비슷하게 랜덤 생성된다.\n\n전투가 종료되면 유저에게 세 가지 선택지를 랜덤으로 제공해줘. \n유저의 선택에 따라 새로운 적과 전투를 시작하거나 쉬어가거나 아이템을 얻어 능력을 업그레이드 할 수 있어.\n\n캐릭터의 공격:\n청룡 - 적에게 번개 공격을 가한다. 5% 확률로 적이 마비가 되어 한 턴 움직일 수 없게 된다.\n백호 - 적에게 물리 공격을 가한다. 5% 확률로 적이 골절되어 한 턴 움직일 수 없게 된다.\n주작 - 적에게 화염 공격을 가한다. 5% 확률로 적이 화상을 입어 지속적으로 약한 데미지를 입는다.\n현무 - 적에게 독 공격을 가한다. 5% 확률로 적이 중독되어 지속적으로 약한 데미지를 입는다.\n\n캐릭터의 필살기:\n청룡 - 아군 캐릭터들의 공격력, 방어력을 20% 증가시킨다.\n백호 - 아군 캐릭터들에게 적의 공격을 1회 튕겨낼 수 있는 보호막을 제공한다.\n주작 - 적에게 현재 공격력의 2배를 가하는 화염 폭풍을 발사한다.\n현무 - 아군 캐릭터들의 체력을 20% 회복시킨다.\n\n적 목록:\n\n구미호 - 아홉 개의 꼬리를 가진 여우 요괴로. 인간의 간을 먹는다는 설화. 쓰러질 때 여우구슬이 깨짐.\n손톱을 이용한 공격, 환각마법을 이용한 공격, 간을 직접 공격, 불마법 사용, 여우구슬을 던짐\n\n도깨비 - 장난기 많고 변덕스러운 성격의 한국 전통 요괴. 도깨비 방망이를 가지고 있어 원하는 것을 만들 수 있는 능력이 있음. 도깨비불 마법으로 공격, 방망이로 만든 금으로 상대를 현혹시켜 한 턴동안 전투불능 상태로 만듦, 방망이로 마구 때림, 과한 장난으로 데미지 입힘, 씨름으로 데미지 입힘\n\n처녀귀신 - 젊은 나이에 죽은 여성의 원혼. 주로 하얀 한복을 입고 긴 머리를 늘어뜨린 모습으로 등장하며 복수심에 불타는 존재로 묘사됨. 환각마법으로 적을 홀려서 절벽으로 유인해 떨어뜨림, 몸을 빼앗아 한 턴동안 전투불능 상태로 만듦, 텔레포트로 갑자기 앞에 나타나 깜짝 놀래켜 쇼크를 유발, 저주를 이용한 공격, 긴 머리카락을 이용해 공격, 출처모를 티비에서 튀어나와 공격\n\n장산범 - 호랑이와 유사한 모습의 요괴로, 장산이라는 산에 산다고 전해짐. 사람의 목소리를 흉내 내어 유인 후 해침. 목소리를 흉내내어 패닉에 빠지게 함, 매복했다가 호랑이로 변신해 공격, 큰 발톱으로 공격, 강한 턱으로 물어 공격, 동료인 척 하며 공격\n\n독각귀 - 한 쪽 뿔을 가진 귀신으로, 사람들에게 불운을 가져다 준다고 전해짐. 얼굴을 가까이 들이밀어 정신적 충격을 줌, 저주마법을 이용해 병에 걸리게 함, 큰 뿔로 들이받음 \n\n산신 - 산을 지키는 신으로, 산의 보호자이자 수호신으로 여겨짐. 금도끼와 은도끼로 내려찍음, 폭우나 산사태를 일으키는 마법 사용, 야생동물을 조종하는 마법으로 공격, 관악산의 정기를 모아서 공격\n\n물귀신 - 물에 빠져 죽은 사람의 원혼으로, 다른 사람을 물속으로 끌어들이려 함. 수중호흡 마술로 물속에 있음, 물로 끌어당겨 공격, 목소리를 흉내내어 사람을 물속으로 꾀어냄, 갑자기 발목을 잡아 끌어당김\n\n인면조- 유교 드래곤으로 상대방의 예의를 나무라며 정신적 공격을 줌. 쑥과 마늘 브레스 사용, 날개 공격, 꼬리 공격, 울부짖어 상태이상, 하늘에 떠서 공격 회피\n\n\n";

    export async function POST(req) {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
        systemInstruction: systemInstruction,
      });
    
      // POST로 전송받은 내용 중 messages를 추출
      const data = await req.json();
      const messages = data.messages;
    
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => ({ text: part.text })),
      }));
    
      // Safety Settings 비활성화를 위한 코드 추가
      model.safetySettings.blockUnsafeContent = false;
    
      // chatHistory 내용을 확인하기 위한 console.log 추가
      console.log('Chat History:', JSON.stringify(chatHistory, null, 2));
    
      try {
        const chat = model.startChat({
          // 컨텍스트 유지를 위해 이전 메시지를 포함해서 보냄
          history: chatHistory,
          generationConfig: {
            // temperature 값이 높을 수록 AI의 답변이 다양해짐
            temperature: 1,
            // max_tokens 값을 제한함. 이 값을 크게 하면 컨텍스트 히스토리에 제약이 커짐.
            maxOutputTokens: 400,
          },
        });
    
        const result = await chat.sendMessage("");
        const response = await result.response;
        const text = await response.text(); // await를 추가하여 Promise 해결
    
        console.log('AI Response:', text); // 콘솔 로그 추가
    
        return new Response(JSON.stringify({
          // AI의 답변은 model 역할로 전송
          role: "model",
          parts: [{ text: text }],
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
    
      } catch (error) {
        console.error('Error in chat API:', error);
        if (error.status === 429) {
          return new Response(JSON.stringify({
            error: 'Too Many Requests',
            message: 'API 요청이 너무 많습니다. 잠시 후에 다시 시도해 주세요.',
          }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({
          error: 'Internal Server Error',
          message: '서버 오류가 발생했습니다. 잠시 후에 다시 시도해 주세요.',
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }