import { GameState } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Trophy, Star } from 'lucide-react';

export default function BoardView({ gameState }: { gameState: GameState }) {
  if (gameState.status === 'lobby') {
    return (
      <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4 md:p-8 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 md:w-64 md:h-64 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 md:w-96 md:h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="z-10 text-center w-full max-w-3xl"
        >
          <div className="mb-8 inline-block">
            <div className="bg-yellow-400 text-blue-900 font-black text-4xl md:text-6xl px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl shadow-[0_6px_0_0_rgba(180,83,9,1)] md:shadow-[0_10px_0_0_rgba(180,83,9,1)] transform -rotate-2">
              FAMILY
            </div>
            <div className="bg-white text-blue-900 font-black text-3xl md:text-5xl px-6 md:px-10 py-3 md:py-4 rounded-2xl md:rounded-3xl shadow-[0_4px_0_0_rgba(156,163,175,1)] md:shadow-[0_8px_0_0_rgba(156,163,175,1)] transform rotate-2 -mt-3 md:-mt-4 ml-4 md:ml-8">
              TEMAN PELAJAR
            </div>
          </div>
          
          <h2 className="text-xl md:text-3xl font-bold mt-8 md:mt-12 mb-4 text-blue-200">Siapkan HP Anda!</h2>
          <div className="bg-blue-800/50 backdrop-blur-md p-6 md:p-8 rounded-2xl md:rounded-3xl border border-blue-400/30 inline-block shadow-2xl w-full">
            <p className="text-lg md:text-2xl mb-2 md:mb-4">Buka browser dan masuk ke link:</p>
            <p className="text-2xl md:text-5xl font-black text-yellow-400 tracking-wider mb-6 md:mb-8 break-all">
              {gameState.customLink || window.location.host}
            </p>
            <div className="flex items-center justify-center gap-2 md:gap-3 text-blue-200">
              <Users className="w-6 h-6 md:w-8 md:h-8" />
              <span className="text-xl md:text-2xl font-semibold">{Object.keys(gameState.players).length} Peserta Bergabung</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameState.status === 'question') {
    const currentQ = gameState.questions[gameState.currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-blue-900 flex flex-col p-4 md:p-8 text-white relative">
        {/* Header */}
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-8 shrink-0">
          <div className="bg-yellow-400 text-blue-900 font-black text-xl md:text-2xl px-4 md:px-6 py-2 rounded-xl shadow-[0_4px_0_0_rgba(180,83,9,1)] text-center w-full md:w-auto">
            FAMILY TEMAN PELAJAR
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 w-full md:w-auto">
            <div className={`px-4 md:px-6 py-2 rounded-xl font-black text-sm md:text-xl border-2 shadow-lg ${
              gameState.round === 'final' 
                ? 'bg-purple-600 border-purple-400 text-white shadow-[0_4px_0_0_rgba(147,51,234,1)]' 
                : 'bg-blue-600 border-blue-400 text-white shadow-[0_4px_0_0_rgba(37,99,235,1)]'
            }`}>
              {gameState.round === 'final' ? 'BABAK FINAL' : 'BABAK PENYISIHAN'}
            </div>
            <div className="bg-blue-800 px-4 md:px-6 py-2 rounded-xl border border-blue-400/30 flex items-center gap-2 md:gap-3">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-300" />
              <span className="text-sm md:text-xl font-bold">
                {Object.values(gameState.players).filter(p => p.answeredCurrent && (gameState.round === 'elimination' || p.isFinalist)).length} / 
                {Object.values(gameState.players).filter(p => gameState.round === 'elimination' || p.isFinalist).length} Menjawab
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area - Centered */}
        <div className="flex-grow flex flex-col items-center justify-center w-full">
          {/* Question */}
          <motion.div 
            key={`q-${gameState.currentQuestionIndex}`}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-5xl bg-blue-800 border-4 border-blue-400 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl mb-6 md:mb-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>
            <h2 className="text-2xl md:text-4xl font-bold leading-snug md:leading-tight">{currentQ.question}</h2>
            
            {gameState.isLocked && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-red-600/90 flex items-center justify-center z-20"
              >
                <span className="text-4xl md:text-7xl font-black text-white tracking-widest drop-shadow-lg">WAKTU HABIS!</span>
              </motion.div>
            )}
          </motion.div>

        {/* Board */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-3 md:gap-6">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-3 md:gap-6">
            {currentQ.answers.slice(0, Math.ceil(currentQ.answers.length / 2)).map((ans: any, idx: number) => {
              const originalIdx = idx;
              const isRevealed = gameState.revealedAnswers.includes(originalIdx);
              
              return (
                <div key={originalIdx} className="relative h-16 md:h-24 perspective-1000">
                  <AnimatePresence mode="wait">
                    {!isRevealed ? (
                      <motion.div
                        key="hidden"
                        initial={{ rotateX: -90 }}
                        animate={{ rotateX: 0 }}
                        exit={{ rotateX: 90 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-gradient-to-b from-blue-600 to-blue-800 border-2 md:border-4 border-blue-400 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                      >
                        <div className="w-12 h-10 md:w-16 md:h-12 bg-blue-900 rounded-full flex items-center justify-center border-2 border-blue-400 shadow-inner">
                          <span className="text-xl md:text-3xl font-black text-blue-300">{originalIdx + 1}</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="revealed"
                        initial={{ rotateX: -90 }}
                        animate={{ rotateX: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-gradient-to-b from-yellow-300 to-yellow-500 border-2 md:border-4 border-yellow-200 rounded-xl md:rounded-2xl flex items-center justify-between px-4 md:px-8 shadow-[0_0_30px_rgba(250,204,21,0.4)]"
                      >
                        <span className="text-lg md:text-3xl font-black text-blue-900 uppercase tracking-wide truncate pr-2 md:pr-4">{ans.text}</span>
                        <div className="bg-blue-900 text-yellow-400 text-xl md:text-3xl font-black px-3 py-1 md:px-6 md:py-2 rounded-lg md:rounded-xl border-2 border-blue-800 shadow-inner min-w-[50px] md:min-w-[80px] text-center">
                          {ans.points}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-3 md:gap-6">
            {currentQ.answers.slice(Math.ceil(currentQ.answers.length / 2)).map((ans: any, idx: number) => {
              const originalIdx = idx + Math.ceil(currentQ.answers.length / 2);
              const isRevealed = gameState.revealedAnswers.includes(originalIdx);
              
              return (
                <div key={originalIdx} className="relative h-16 md:h-24 perspective-1000">
                  <AnimatePresence mode="wait">
                    {!isRevealed ? (
                      <motion.div
                        key="hidden"
                        initial={{ rotateX: -90 }}
                        animate={{ rotateX: 0 }}
                        exit={{ rotateX: 90 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-gradient-to-b from-blue-600 to-blue-800 border-2 md:border-4 border-blue-400 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                      >
                        <div className="w-12 h-10 md:w-16 md:h-12 bg-blue-900 rounded-full flex items-center justify-center border-2 border-blue-400 shadow-inner">
                          <span className="text-xl md:text-3xl font-black text-blue-300">{originalIdx + 1}</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="revealed"
                        initial={{ rotateX: -90 }}
                        animate={{ rotateX: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-gradient-to-b from-yellow-300 to-yellow-500 border-2 md:border-4 border-yellow-200 rounded-xl md:rounded-2xl flex items-center justify-between px-4 md:px-8 shadow-[0_0_30px_rgba(250,204,21,0.4)]"
                      >
                        <span className="text-lg md:text-3xl font-black text-blue-900 uppercase tracking-wide truncate pr-2 md:pr-4">{ans.text}</span>
                        <div className="bg-blue-900 text-yellow-400 text-xl md:text-3xl font-black px-3 py-1 md:px-6 md:py-2 rounded-lg md:rounded-xl border-2 border-blue-800 shadow-inner min-w-[50px] md:min-w-[80px] text-center">
                          {ans.points}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (gameState.status === 'leaderboard') {
    const winnerCount = gameState.winnerCount || 3;
    const displayCount = gameState.leaderboardDisplayCount || 5;
    const sortedPlayers = Object.values(gameState.players).sort((a, b) => b.score - a.score).slice(0, displayCount);
    
    return (
      <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4 md:p-8 text-white relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Confetti effect could go here */}
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="z-10 w-full max-w-4xl"
        >
          <div className="text-center mb-8 md:mb-12">
            <Trophy className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 uppercase tracking-widest drop-shadow-sm">
              Juara Family Teman Pelajar
            </h1>
          </div>

          <div className="space-y-3 md:space-y-4">
            {sortedPlayers.map((player, idx) => {
              const isWinner = idx < winnerCount;
              return (
                <motion.div
                  key={player.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center justify-between rounded-xl md:rounded-2xl border-2 ${
                    isWinner 
                      ? 'p-4 md:p-6 bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-200 text-blue-900 transform md:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.5)] md:shadow-[0_0_30px_rgba(250,204,21,0.5)] z-10 relative mb-4 md:mb-6' 
                      : 'p-3 md:p-4 bg-blue-800 border-blue-400 text-white opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className={`rounded-full flex items-center justify-center font-black ${
                      isWinner ? 'w-10 h-10 md:w-12 md:h-12 text-xl md:text-2xl bg-blue-900 text-yellow-400' : 'w-8 h-8 md:w-10 md:h-10 text-lg md:text-xl bg-blue-900 text-blue-300'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className={`font-bold ${isWinner ? 'text-xl md:text-3xl text-blue-900' : 'text-lg md:text-xl text-white'}`}>{player.name}</h3>
                      <p className={`font-medium ${isWinner ? 'text-sm md:text-lg text-blue-800' : 'text-xs md:text-sm text-blue-300'}`}>{player.branch}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Star className={`fill-current ${isWinner ? 'w-6 h-6 md:w-8 md:h-8 text-blue-900' : 'w-5 h-5 md:w-6 md:h-6 text-yellow-400'}`} />
                    <span className={`font-black ${isWinner ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'}`}>{player.score}</span>
                  </div>
                </motion.div>
              );
            })}
            
            {sortedPlayers.length === 0 && (
              <div className="text-center text-xl md:text-2xl text-blue-300 py-8 md:py-12">
                Belum ada pemain yang bergabung.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
