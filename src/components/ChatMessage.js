'use client';

import React from 'react';

const ChatMessage = ({ message }) => {
  const { text, sender } = message;

  const messageClass = sender === 'ai' ? 'bg-gray-300 text-left' : 'bg-blue-100 text-right';

  return (
    <div className={`p-4 ${messageClass}`}>
      <p className="inline-block p-2 rounded">{text}</p>
    </div>
  );
};

export default ChatMessage;
