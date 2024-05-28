'use client';

import React from 'react';
import { auth, provider } from '@/firebase';
import { signInWithPopup } from 'firebase/auth';

const StartScreen = ({ setUser }) => {
  const handleLogin = async () => {
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
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleLogin}
        >
          소셜 로그인
        </button>
      </div>
    </div>
  );
};

export default StartScreen;