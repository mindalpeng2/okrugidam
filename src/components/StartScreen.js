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
    <div className="relative h-screen w-screen" style={{ backgroundImage: 'url(/assets/LoginBG.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>

        <p className="mb-8" style={{
          position: "absolute",
          right: "19.20%",
          top: "24.58%",
          transform: "translate(-50%, -50%)",
          width: "calc(363px / 1440 * 100%)", // 글자칸의 너비
          height: "calc(186px / 1025 * 100%)" // 글자칸의 높이
      
        }}>세계관 설명창 여기에 설명을 쓸 예정입니다.</p>
  <div className="text-center">     
         <button 
           className="px-4 py-2 rounded-lg"
           onClick={handleLogin}
           style={{
             backgroundImage: "url('/assets/LoginBTT.png')",
             backgroundSize: "cover",
             backgroundPosition: "center",
             width: "150px", // 버튼의 너비를 이미지에 맞게 설정
             height: "50px", // 버튼의 높이를 이미지에 맞게 설정
             border: "none",

           }}></button>
            </div> 
    </div>
  );
  };
  
  export default StartScreen;
    
