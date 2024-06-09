'use client';

import React from 'react';

export const ChatBubble = ({ message }) => {
  const { text, sender, senderName } = message; // senderName 필드를 추가

  // 메시지의 역할에 따라 배경색을 설정합니다.
  const messageStyle = sender === 'ai'
    ? { backgroundColor: '#946E56', color: 'white' }
    : { backgroundColor: 'white', color: 'black' };

  return (
    <div className={`flex flex-col ${sender === 'ai' ? 'items-start' : 'items-end'}`}>
      <div
        className="flex items-center rounded-2xl px-3 py-2 whitespace-pre-wrap"
        style={{ overflowWrap: 'anywhere', ...messageStyle }}
      >
        <strong>{senderName || sender}</strong>: {text}
      </div>
    </div>
  );
};

export default ChatBubble;
