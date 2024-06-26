import { IconArrowUp } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

export const ChatInput = ({ onSendMessage }) => {
  const [content, setContent] = useState('');

  const textareaRef = useRef(null);
  const sendingMessageRef = useRef(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);
  };

  const handleSend = () => {
    console.log("handleSend called");
    if (!content || sendingMessageRef.current) {
      console.log("Message not sent: Empty content or message already being sent");
      return;
    }

    sendingMessageRef.current = true;
    onSendMessage({ role: "user", parts: [{ text: content }] });
    console.log("Message sent:", content);
    setContent("");
    setTimeout(() => {
      sendingMessageRef.current = false;
    }, 1000); // Prevent double sending within 1 second
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className="min-h-[44px] rounded-lg pl-4 pr-12 py-2 w-full focus:outline-none focus:ring-1 focus:ring-neutral-300 border-2 border-neutral-200"
        style={{ resize: "none", color: "black" }}
        placeholder="메시지를 입력하세요"
        value={content}
        rows={1}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />

      <button onClick={handleSend}>
        <IconArrowUp className="absolute right-2 bottom-3 h-8 w-8 hover:cursor-pointer rounded-full p-1 bg-blue-500 text-white hover:opacity-80" />
      </button>
    </div>
  );
};

export default ChatInput;
