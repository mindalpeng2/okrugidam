'use client';
import "./globals.css";


import { SessionProvider } from 'next-auth/react';

import React, { useState } from 'react';
import StartScreen from '@/components/StartScreen';
import GameScreen from '@/components/GameScreen';
import TestComponent from '@/components';

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


 