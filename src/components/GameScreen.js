'use client';

import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../app/firebase';
import ChatMessage from './ChatMessage';

const GameScreen = ({ user, setUser }) => {
  const [message, setMessage] = useState('');
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

  const handleSend = async () => {
    if (message.trim() === '') return;

    setLoading(true);
    await addDoc(collection(db, 'messages'), {
      text: message,
      uid: user.uid,
      createdAt: new Date()
    });
    setMessage(''); // 여기서 입력 필드를 초기화

    // Simulate AI response
    setTimeout(async () => {
      await addDoc(collection(db, 'messages'), {
        text: "AI 응답",
        uid: 'ai',
        createdAt: new Date()
      });
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    // 로그아웃 시 시작 화면으로 이동
    setUser(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex justify-end p-4 bg-gray-800 text-white">
        <button onClick={handleLogout}>로그아웃</button>
      </header>
      <div className="flex flex-1">
        <div className="w-1/4 p-4">
          <img src="/path/to/enemy-image.png" alt="Enemy" />
        </div>
        <div className="w-2/4 p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {loading && <div className="text-center">...</div>}
          </div>
          <div className="flex">
            <input
              type="text"
              className="flex-1 border p-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
            />
            <button className="bg-blue-500 text-white p-2" onClick={handleSend}>전송</button>
          </div>
        </div>
        <div className="w-1/4 p-4">
          <img src="/path/to/character-image.png" alt="Character" />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
