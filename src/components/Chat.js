// 입력창, 로딩 3점 표시, 채팅 말풍선 컴포넌트 가져오기
import { ChatInput } from "./ChatInput";
import { ChatLoader } from "./ChatLoader";
import { ChatBubble } from "./ChatMessage";
import { useEffect, useRef } from "react";

export const Chat = ({ messages, loading, onSendMessage }) => {
  const messagesEndRef = useRef(null);

  // 메시지 목록을 끝으로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("Messages updated in Chat component:", messages); // 디버깅 로그 추가
    console.log("Loading state in Chat component:", loading); // 디버깅 로그 추가
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex flex-col rounded-lg px-2 sm:p-4 sm:border border-neutral-300 h-[90vh] w-full max-w-2xl mx-auto" style={{ backgroundColor: '#E6D4BF' }}>
      <div className="flex-1 overflow-y-auto">
        {/* messages 의 내용을 ChatBubble 컴포넌트를 통해 출력 */}
        {messages.map((message, index) => (
          <div key={index} className="my-1 sm:my-1.5">
            <ChatBubble message={message} />
          </div>
        ))}

        {/* loading 이 true 면 ChatLoader 를 표시 */}
        {loading && (
          <div className="my-1 sm:my-1.5">
            <ChatLoader />
          </div>
        )}
        {/* 메시지 목록의 끝으로 스크롤하기 위해 참조하는 엘리먼트 */}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 sm:mt-8 w-full ">
        {/* 채팅 입력창을 표시, 전송 액션을 실행하는 onSend 함수를 넘겨준다 */}
        <ChatInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

export default Chat;
