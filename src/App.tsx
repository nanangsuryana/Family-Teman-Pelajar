/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { socket } from './socket';
import PlayerView from './components/PlayerView';
import BoardView from './components/BoardView';
import HostView from './components/HostView';

export interface GameState {
  status: 'lobby' | 'question' | 'leaderboard';
  currentQuestionIndex: number;
  revealedAnswers: number[];
  players: Record<string, any>;
  questions: any[];
  round: 'elimination' | 'final';
  winnerCount: number;
  finalistCount: number;
  leaderboardDisplayCount: number;
  customLink?: string;
  eliminationQuestionCount: number;
  finalQuestionCount: number;
  isLocked: boolean;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const onStateUpdate = (state: GameState) => {
      setGameState(state);
    };
    
    socket.on('state_update', onStateUpdate);

    const onConnect = () => {
      socket.emit('request_state');
    };

    if (socket.connected) {
      socket.emit('request_state');
    } else {
      socket.on('connect', onConnect);
    }

    return () => {
      socket.off('state_update', onStateUpdate);
      socket.off('connect', onConnect);
    };
  }, []);

  if (!gameState) {
    return <div className="min-h-screen flex items-center justify-center bg-blue-900 text-white">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlayerView gameState={gameState} />} />
        <Route path="/board" element={<BoardView gameState={gameState} />} />
        <Route path="/host" element={<HostView gameState={gameState} />} />
      </Routes>
    </BrowserRouter>
  );
}

