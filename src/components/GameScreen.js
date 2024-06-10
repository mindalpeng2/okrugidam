'use client';
import Head from "next/head";
import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { db, saveGameData } from '@/firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import Chat from './Chat';

const GameScreen = () => {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monsterImage, setMonsterImage] = useState(null);
  const [characterImage, setCharacterImage] = useState(null);
  const messagesEndRef = useRef(null);
  const userId = session?.user?.id || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    saveGameData();
    if (userId) {
      const q = query(
        collection(db, 'messages'),
        where('userId', '==', userId),
        orderBy('createdAt')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(messages);
        scrollToBottom();
      });

      return () => unsubscribe();
    }
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'ai') {
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

        if (lastMessage.text.includes('승리했습니다')) {
          setMonsterImage(null);
          setCharacterImage(null);
        }

        if (lastMessage.text.includes('전투 중이 아니랍니다!')) {
          setMonsterImage(null);
          setCharacterImage(null);
        }
        

      } else if (lastMessage.sender !== 'ai') {
        if (lastMessage.text.includes('청룡')) {
          setCharacterImage('/characters/cheongryong.png');
        } else if (lastMessage.text.includes('백호')) {
          setCharacterImage('/characters/baekho.png');
        } else if (lastMessage.text.includes('주작')) {
          setCharacterImage('/characters/jujak.png');
        } else if (lastMessage.text.includes('현무')) {
          setCharacterImage('/characters/hyunmu.png');
        }
      }
    }
  }, [messages]);

  const handleSendMessage = async (messageContent) => {
    console.log("handleSendMessage called with content:", messageContent);
    if (!messageContent || !messageContent.parts[0].text.trim()) return;

    const newMessage = {
      text: messageContent.parts[0].text,
      sender: session?.user?.name || 'unknown',
      senderName: session?.user?.name || 'unknown',
      userId: session?.user?.email || session?.user?.id || 'unknown',
      createdAt: new Date(),
    };

    console.log("New message created:", newMessage);

    // 사용자 메시지를 먼저 화면에 반영합니다.
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage];
      console.log("Messages updated with user message:", updatedMessages);
      return updatedMessages;
    });

    // Firebase에 사용자 메시지를 추가합니다.
    await addDoc(collection(db, 'messages'), newMessage);

    setLoading(true);

    try {
      // 현재 메시지 목록에 새로운 메시지를 추가합니다.
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
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      if (responseData.error) {
        throw new Error(responseData.message);
      }

      const aiMessage = {
        text: responseData.parts[0].text,
        sender: 'ai',
        senderName: 'AI',
        userId: session?.user?.email || session?.user?.id || 'unknown',
        createdAt: new Date(),
      };

      console.log("AI response received:", aiMessage);

      // Firebase에 AI 메시지를 추가합니다.
      await addDoc(collection(db, 'messages'), aiMessage);

      // 상태를 업데이트하여 AI 메시지를 UI에 반영합니다.
      setMessages(prevMessages => {
        const newMessages = [...prevMessages, aiMessage];
        const seen = new Set();
        const filteredMessages = newMessages.filter(msg => {
          const duplicate = seen.has(msg.text);
          seen.add(msg.text);
          return !duplicate;
        });
        console.log("Filtered messages:", filteredMessages);
        return filteredMessages;
      });

    } catch (error) {
      console.error('Error sending message to /api/chat:', error);
      alert('서버 오류가 발생했습니다. 잠시 후에 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const resetGame = async () => {
    const confirmReset = confirm('모든 대화 내용이 사라지고 새로운 게임이 시작됩니다. 초기화하시겠습니까?');
    if (confirmReset) {
      if (userId) {
        // Firebase에서 유저의 모든 메시지를 삭제합니다.
        const q = query(
          collection(db, 'messages'),
          where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const batch = writeBatch(db);

        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();

        // 게임 데이터를 초기화합니다.
        saveGameData();

        // 메시지 상태를 초기화합니다.
        setMessages([]);

        // 몬스터 및 캐릭터 이미지를 초기화합니다.
        setMonsterImage(null);
        setCharacterImage(null);
      }
    }
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
          onClick={() => signOut()}
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
        <button 
          onClick={resetGame}
          style={{
            position: 'absolute',
            right: '20px',
            bottom: '20px',
            padding: '5px 10px',
            border: '1px solid white', // 흰색 테두리로 설정
            color: 'white',
            backgroundColor: 'transparent', // 배경색 제거
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 10, // ensure the button is on top
            display: 'flex', // ensure padding and size are correctly applied
            justifyContent: 'center', // center the text
            alignItems: 'center', // center the text vertically
          }}
        >
          초기화
        </button>
      </div>
    </div>
  );  
};

export default GameScreen;
