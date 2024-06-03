'use client';
import Head from "next/head";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { db } from '@/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Chat } from './Chat';

const GameScreen = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messages);
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
      createdAt: new Date()
    };
    await addDoc(collection(db, 'messages'), newMessage);

    // 예전코드: Simulate AI response
    // setTimeout(async () => {
    //   const aiMessage = {
    //     text: "AI 응답",
    //     sender: 'ai',
    //     senderName: 'AI',
    //     createdAt: new Date()
    //   };
    //   await addDoc(collection(db, 'messages'), aiMessage);
    //   setLoading(false);
    // }, 1000);
    //이후 교수님께서 전에 올려주셨던 코드를 참고하면서 해봤음. 

    setTimeout(async () => {
      try {
        // 사용자 메시지를 챗봇 쪽으로 전송
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: newMessage })
        });

        // API 응답을 JSON 형태로 변환
        const data = await response.json();

        // API 응답 메시지를 Firestore에 추가
        const aiMessage = {
          text: data.text,
          sender: 'ai',
          senderName: 'AI',
          createdAt: new Date()
        };

        await addDoc(collection(db, 'messages'), aiMessage);

        // 메시지 목록 상태를 업데이트
        setMessages(prevMessages => [...prevMessages, aiMessage]);

      } catch (error) {
        console.error('Error sending message to /api/chat:', error);
      } finally {
        // 로딩 상태를 해제
        setLoading(false);
      }
    }, 1000);
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="flex justify-between items-center p-4 bg-gray-800 text-white w-full">
        <div>Welcome, {session?.user?.name}!</div>
        <button onClick={handleLogout}>로그아웃</button>
      </header>
      <div className="flex flex-1 items-center justify-center w-full">
        <div className="flex w-full h-full items-center justify-center">
          <div className="w-1/4 p-4 h-full flex items-center justify-center">
            <img src="/path/to/enemy-image.png" alt="Enemy" className="max-h-full" />
          </div>
          <div className="w-2/4 p-4 flex flex-col items-center h-full">
            <Chat messages={messages} loading={loading} onSendMessage={handleSendMessage} />
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
