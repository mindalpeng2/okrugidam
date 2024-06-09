'use client';
import Head from "next/head";
import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { db, saveGameData } from '@/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import Chat from './Chat'; // 기본 내보내기로 가져오기

const GameScreen = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monsterImage, setMonsterImage] = useState(null);
  const [characterImage, setCharacterImage] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Save game data when the component mounts
    saveGameData(); // 호출 위치 변경

    const q = query(collection(db, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'ai') {
        // 몬스터 일러스트 경로 설정
        if (lastMessage.text.includes('구미호')) {
          setMonsterImage('/monsters/gumiho.png');
        } else if (lastMessage.text.includes('장산범')) {
          setMonsterImage('/monsters/jangsanbeom.png');
        } else if (lastMessage.text.includes('처녀귀신')) {
          setMonsterImage('/monsters/maiden.png');
        } else if (lastMessage.text.includes('독각귀')) {
          setMonsterImage('/monsters/dokgak.png');
        } else if (lastMessage.text.includes('산신')) {
          setMonsterImage('/monsters/mountgod.png');
        } else if (lastMessage.text.includes('물귀신')) {
          setMonsterImage('/monsters/water.png');
        } else if (lastMessage.text.includes('도깨비')) {
          setMonsterImage('/monsters/dokkaebi.png');
        } else if (lastMessage.text.includes('인면조')) {
          setMonsterImage('/monsters/ykdragon.png');
        }
        
        if (lastMessage.text.includes('물리쳤습니다')) {
          setMonsterImage(null);
        }
        // 추가적인 몬스터 조건 처리
      } else if (lastMessage.sender !== 'ai') {
        // 캐릭터 일러스트 경로 설정
        if (lastMessage.text.includes('청룡')) {
          setCharacterImage('/characters/cheongryong.png');
        } else if (lastMessage.text.includes('백호')) {
          setCharacterImage('/characters/baekho.png');
        } else if (lastMessage.text.includes('주작')) {
          setCharacterImage('/characters/jujak.png');
        } else if (lastMessage.text.includes('현무')) {
          setCharacterImage('/characters/hyunmu.png');
        }
        // 추가적인 캐릭터 조건 처리
      }
    }
  }, [messages]);

  const handleSendMessage = async (messageContent) => {
    if (!messageContent || !messageContent.parts[0].text.trim()) return;
  
    setLoading(true);
    const newMessage = {
      text: messageContent.parts[0].text,
      sender: session?.user?.name || 'unknown',
      senderName: session?.user?.name || 'unknown',
      createdAt: new Date(),
    };
  
    await addDoc(collection(db, 'messages'), newMessage);
  
    // 새로운 메시지가 추가된 후에 API에 요청을 보냅니다.
    setTimeout(async () => {
      try {
        const formattedMessages = [
          ...messages.map(msg => ({
            role: msg.sender === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          })),
          {
            role: 'user',
            parts: [{ text: newMessage.text }]
          }
        ];
  
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: formattedMessages })
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
  
        const aiMessage = {
          text: data.parts[0].text,
          sender: 'ai',
          senderName: 'AI',
          createdAt: new Date(),
        };
  
        await addDoc(collection(db, 'messages'), aiMessage);
  
        // 중복 추가 방지를 위해 이 부분을 수정
        setMessages(prevMessages => {
          const newMessages = [...prevMessages, aiMessage];
          const seen = new Set();
          return newMessages.filter(msg => {
            const duplicate = seen.has(msg.text);
            seen.add(msg.text);
            return !duplicate;
          });
        });
  
      } catch (error) {
        console.error('Error sending message to /api/chat:', error);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ backgroundImage: 'url(/assets/BattleBG.png)', backgroundSize: 'cover' }}>
      <header className="flex justify-between items-center p-4 w-full flex-shrink-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', zIndex: 2 }}>
        <div style={{ 
          color: 'white', 
          textShadow: '1px 1px 0 #0f0f41, -1px -1px 0 #0f0f41, -1px 1px 0 #0f0f41, 1px -1px 0 #0f0f41',
          fontWeight: 'bold' 
        }}>
          {session?.user?.name} 공 어서 오시게나!
        </div>
        <button 
          onClick={handleLogout}
          style={{
            pointerEvents: 'all',
            backgroundImage: "url('/assets/LogoutBTT.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: '80px',
            height: '40px',
            border: "none",
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            borderRadius: '7px'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        ></button>
      </header>
      <div className="flex flex-1 items-center justify-center w-full relative overflow-visible">
        <img src="/assets/Jockjaaa.png" alt="족자 이미지" className="absolute w-2/5" style={{ top: '-10px', transform: 'scale(1.2)', zIndex: 9 }} />
        <div className="w-1/4 p-4 h-full flex items-center justify-center" style={{ zIndex: 3 }}>
          {monsterImage && <img src={monsterImage} alt="Monster" className="max-h-full mx-auto" />}
        </div>
        <div className="w-2/5 p-0 flex flex-col items-center h-full overflow-hidden" style={{ zIndex: 3 }}>
          <Chat messages={messages} loading={loading} onSendMessage={handleSendMessage} />
          <div ref={messagesEndRef} />
        </div>
        <div className="w-1/4 p-4 h-full flex items-center justify-center" style={{ zIndex: 3 }}>
          {characterImage && <img src={characterImage} alt="Character" className="max-h-full mx-auto" />}
        </div>
      </div>
    </div>
  );  
};

export default GameScreen;
