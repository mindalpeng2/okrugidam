// 이 파일이 존재하고 앱 전체를 감싸는 구조라면 SessionProvider를 여기서 사용할 수 있습니다. 
// 이를 통해 모든 컴포넌트에서 세션 정보를 접근할 수 있습니다.

"use client";

import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
