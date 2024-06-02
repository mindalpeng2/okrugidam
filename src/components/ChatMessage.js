'use client';

import React from 'react';

export const ChatBubble = ({ message }) => {
  const { text, sender, senderName } = message; // senderName 필드를 추가
  const messageClass = sender === 'ai' ? 'bg-gray-300 text-left' : 'bg-blue-100 text-right';

  return (
    <div className={`flex flex-col ${sender === 'ai' ? 'items-start' : 'items-end'}`}>
  <div
        className={`flex items-center ${
          message.role === "model"
            ? "bg-neutral-200 text-neutral-900"
            : "bg-blue-500 text-white"
        } rounded-2xl px-3 py-2 max-w-[67%] whitespace-pre-wrap`}
        style={{ overflowWrap: "anywhere" }}
      >
        <strong>{senderName || sender}</strong>: {text}
      </div>
    </div>
  );
};

export default ChatBubble;
