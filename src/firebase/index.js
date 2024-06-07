import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db };

// Game data save function
export const saveGameData = async () => {
  try {
    const gameDocRef = doc(db, 'games', 'chatbotGame');
    const gameData = {
      story: "너를 이용해서 챗봇 게임을 만들려고 해. 나는 게임 플레이어고 너는 게임의 안내자 역할을 해줘. 게임의 적은 임의로 생성하지 말고 '적 목록'에 있는 적들로만 생성해줘. 유저는 반드시 청룡, 백호, 주작, 현무 순서대로만 공격할 수 있어. 첫 공격때 유저는 백호, 주작, 현무를 선택할 수 없어. (유저는 공격할 캐릭터의 순서를 선택할 수 없어)",
      gameMechanics: {
        gameplay: "유저는 청룡, 백호, 주작, 현무 네 명의 캐릭터를 이용해서 하나의 적에게 공격할 수 있다. 유저는 반드시 청룡, 백호, 주작, 현무 순서대로만 공격할 수 있다. 각각의 캐릭터에게 '공격', '필살기' 등의 명령어로 지시할 수 있다. 캐릭터, '공격' 또는 공격이 들어간 채팅을 입력하면 해당 캐릭터가 적에게 공격한다. '필살기' 또는 필살기가 들어간 채팅을 입력하면 해당 캐릭터가 적에게 특수공격을 발동한다. 적을 공격하면 적이 입은 데미지를 표시한다. 4명의 캐릭터가 턴을 마치면 적이 4명의 캐릭터에게 동시에 공격한다. 같은 캐릭터를 연속으로 선택하지 못하게 한다. 같은 캐릭터를 연속으로 선택할 경우 아직 회복하지 못해서 능력을 사용하지 못한다고 언급한다.",
        characterStats: {
          health: 100,
          attack: 10,
          defense: 10
        },
        characterAbilities: {
          청룡: {
            attack: "번개 공격",
            special: "공격력, 방어력 20% 증가"
          },
          백호: {
            attack: "물리 공격",
            special: "보호막 제공"
          },
          주작: {
            attack: "화염 공격",
            special: "화염 폭풍"
          },
          현무: {
            attack: "독 공격",
            special: "체력 20% 회복"
          }
        },
        enemyList: [
          { name: "구미호", abilities: ["손톱 공격", "환각마법", "간 공격", "불마법", "여우구슬"] },
          { name: "도깨비", abilities: ["도깨비불", "방망이 공격", "금 현혹", "장난", "씨름"] },
          { name: "처녀귀신", abilities: ["환각", "몸 빼앗기", "텔레포트", "저주", "머리카락 공격", "티비 공격"] },
          { name: "장산범", abilities: ["목소리 흉내", "호랑이 변신", "발톱 공격", "턱 공격", "동료 공격"] },
          { name: "독각귀", abilities: ["정신 충격", "저주마법", "뿔 공격"] },
          { name: "산신", abilities: ["금도끼 공격", "폭우", "산사태", "야생동물 조종", "정기 공격"] },
          { name: "물귀신", abilities: ["수중호흡", "물로 끌어당김", "목소리 흉내", "발목 잡기"] },
          { name: "인면조", abilities: ["예의 나무라기", "쑥과 마늘 브레스", "날개 공격", "꼬리 공격", "울부짖기", "공격 회피"] }
        ]
      }
    };

    await setDoc(gameDocRef, gameData);
    console.log("Game data successfully written to Firestore");
  } catch (error) {
    console.error("Error writing game data to Firestore:", error);
  }
};
