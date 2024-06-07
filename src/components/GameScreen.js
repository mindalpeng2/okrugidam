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
    <div className="h-screen w-screen flex flex-col" style={{ backgroundImage: 'url(/assets/BattleBG.png)', backgroundSize: 'cover' }}>
      <header className="flex justify-between items-center p-4 bg-gray-800 text-white w-full">
        <div>Welcome, {session?.user?.name}!</div>
        <button onClick={handleLogout}>로그아웃</button>
      </header>
      <div className="flex flex-1 items-center justify-center w-full">
        <div className="flex w-full h-full items-center justify-center">
          <div className="w-1/4 p-4 h-full flex items-center justify-center">
            <img src="/path/to/enemy-image.png" alt="Enemy" className="max-h-full" />
          </div>
          <div className="w-2/5 p-0 flex flex-col items-center h-full">
            <Chat messages={messages} loading={loading} onSendMessage={handleSendMessage} />
            <div ref={messagesEndRef} />
          </div>
          <div className="w-1/4 p-4 h-full flex items-center justify-center">
            <img src="/path/to/character-image.png" alt="Character" className="max-h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
