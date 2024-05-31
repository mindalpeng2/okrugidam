'use client';

import React from 'react';

const ChatMessage = ({ message }) => {
  const { text, sender, senderName } = message; // senderName 필드를 추가

  const messageClass = sender === 'ai' ? 'bg-gray-300 text-left' : 'bg-blue-100 text-right';

  return (
    <div className={`p-4 ${messageClass}`}>
      <p className="inline-block p-2 rounded">
        <strong>{senderName || sender}</strong>: {text} // 메시지를 보낼 때 발신자의 이름을 표시합니다. 발신자 이름이 없는 경우, 기본적으로 sender를 표시합니다.
      </p>
    </div>
  );
};

export default ChatMessage;
