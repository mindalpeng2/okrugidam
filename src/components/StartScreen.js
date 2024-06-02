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
    await signIn('kakao');
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
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">게임 제목</h1>
        <p className="mb-8">게임 설명</p>
        {status === 'unauthenticated' && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleLogin}
          >
            소셜 로그인
          </button>
        )}
      </div>
    </div>
  );
};

export default StartScreen;