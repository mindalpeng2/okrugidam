'use client';

import { SessionProvider } from 'next-auth/react';

import React, { useState } from 'react';
import StartScreen from '@/components/StartScreen';
import GameScreen from '@/components/GameScreen';

export default function Home() {
  const [user, setUser] = useState(null);

  return (
    <SessionProvider>
      <div>
        {!user ? (
          <StartScreen setUser={setUser} />
        ) : (
          <GameScreen user={user} />
        )}
      </div>
    </SessionProvider>
  );
}
