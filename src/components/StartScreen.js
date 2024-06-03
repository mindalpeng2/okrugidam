'use client';

import React, { useEffect } from 'react'; 
// 세션 상태가 'authenticated'로 변경되면 setUser를 호출하여 로그인한 유저의 정보를 설정합니다.
import { useSession, signIn } from 'next-auth/react'; // next-auth 훅을 가져옵니다.
import { auth, provider } from '@/firebase';
import { signInWithPopup } from 'firebase/auth';

const StartScreen = ({ setUser }) => {
  const { data: session, status } = useSession();
  //next-auth/react에서 가져오는 훅으로, 현재 세션 상태와 유저 정보를 가져올 수 있습니다.

  useEffect(() => {
    if (status === 'authenticated' && session) {
      setUser(session.user);
    }
  }, [session, status, setUser]);

  const handleLogin = async () => {
    // await signIn('kakao');
    //NextAuth.js에서 제공하는 함수로, 카카오톡 로그인을 시작합니다.
    
    // Firebase 로그인 관련 코드는 주석 처리합니다.
    // try {
    //   const result = await signInWithPopup(auth, provider);
    //   setUser(result.user);
    // } catch (error) {
    //   console.error("Error logging in: ", error);
    // }

    // 로그인 없이 게임 화면으로 이동
    setUser({ uid: 'guest' });
  };

 
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      <img src="/assets/LoginBG.gif" alt="배경 GIF" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      <div style={{ 
        position: 'absolute', 
        top: 'calc(50% + 10%)', // 화면의 세로 기준으로 중간보다 살짝 아래
        left: '50%', // 가로 중앙
        transform: 'translate(-50%, -50%)', // 위치 조정
        pointerEvents: 'none' // 이미지가 클릭되지 않도록 설정
      }}>
        <button 
          className="rounded-lg"
          onClick={handleLogin}
          style={{
            pointerEvents: 'all', // 버튼은 클릭 가능하도록 설정
            backgroundImage: "url('/assets/LoginBTT.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "10vw", // 버튼의 너비를 뷰포트 너비의 10%로 설정
            aspectRatio: '205 / 118', // 비율 유지
            border: "none",
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        ></button>
      </div> 
    </div>
  );
};

export default StartScreen;
