'use client';

import React from 'react';

export const ChatBubble = ({ message }) => {
  const { parts, role } = message;
  const text = parts && parts[0] && parts[0].text ? parts[0].text : '';
  const senderName = role === 'user' ? 'User' : 'AI';

  // 메시지의 역할에 따라 배경색을 설정합니다.
  const messageStyle = role === 'ai'
    ? { backgroundColor: '#946E56', color: 'white' }
    : { backgroundColor: 'white', color: 'black' };

  return (
    <div className={`flex flex-col ${role === 'ai' ? 'items-start' : 'items-end'}`}>
      <div
        className="flex items-center rounded-2xl px-3 py-2 max-w-[67%] whitespace-pre-wrap"
        style={{ overflowWrap: 'anywhere', ...messageStyle }}
      >
        <strong>{senderName}</strong>: {text}
      </div>
    </div>
  );
};

export default ChatBubble;
