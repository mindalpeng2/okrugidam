'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { db } from '@/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Chat } from './Chat';

const GameScreen = () => { 
  const { data: session } = useSession(); 
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

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

    // Simulate AI response
    setTimeout(async () => {
      const aiMessage = {
        text: "AI 응답",
        sender: 'ai',
        senderName: 'AI',
        createdAt: new Date()
      };
      await addDoc(collection(db, 'messages'), aiMessage);
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex justify-between items-center p-4 bg-gray-800 text-white"> 
        <div>Welcome, {session?.user?.name}!</div> 
        <button onClick={handleLogout}>로그아웃</button> 
      </header>
      <div className="flex flex-1">
        <div className="w-1/4 p-4">
          <img src="/path/to/enemy-image.png" alt="Enemy" />
        </div>
        <div className="w-2/4 p-4 flex flex-col">
          <Chat messages={messages} loading={loading} onSendMessage={handleSendMessage} />
        </div>
        <div className="w-1/4 p-4">
          <img src="/path/to/character-image.png" alt="Character" />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
