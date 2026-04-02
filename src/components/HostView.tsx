import { GameState } from '../App';
import { socket } from '../socket';
import { Play, SkipForward, Trophy, RotateCcw, Eye, Star, Lock, Unlock, Settings } from 'lucide-react';
import { useState, FormEvent } from 'react';

export default function HostView({ gameState }: { gameState: GameState }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('host_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (username === 'admin.tp' && password === 'Teman.1133') {
      setIsLoggedIn(true);
      sessionStorage.setItem('host_authenticated', 'true');
      setError('');
    } else {
      setError('Username atau Password salah!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('host_authenticated');
  };

  const handleStart = () => socket.emit('host_action', { action: 'start_game' });
  const handleReset = () => {
    if (confirm('Are you sure you want to reset the game? All scores will be cleared.')) {
      socket.emit('host_action', { action: 'reset_game' });
    }
  };
  const handleStartFinal = () => socket.emit('host_action', { action: 'start_final_round' });
  const handleNext = () => socket.emit('host_action', { action: 'next_question' });
  const handleShowQuestion = () => socket.emit('host_action', { action: 'show_question' });
  const handleLock = () => socket.emit('host_action', { action: 'lock_submissions' });
  const handleRevealAll = () => socket.emit('host_action', { action: 'reveal_all' });
  const handleReveal = (index: number) => socket.emit('host_action', { action: 'reveal_answer', payload: { index } });
  const handleLeaderboard = () => socket.emit('host_action', { action: 'show_leaderboard' });
  const handleLobby = () => socket.emit('host_action', { action: 'back_to_lobby' });

  const playersList = Object.values(gameState.players);
  const activePlayers = playersList.filter(p => gameState.round === 'elimination' || p.isFinalist);
  const answeredCount = activePlayers.filter(p => p.answeredCurrent).length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Host Login</h1>
            <p className="text-gray-500">Akses khusus untuk panitia</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Masukkan username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Masukkan password"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95"
            >
              Masuk ke Panel Host
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Host Control Panel</h1>
          <div className="flex gap-4 items-center">
            <button 
              onClick={handleLogout}
              className="bg-white text-red-600 border-2 border-red-100 hover:bg-red-50 px-4 py-2 rounded-lg shadow-sm font-bold text-sm transition-all"
            >
              Logout
            </button>
            <div className="bg-white px-4 py-2 rounded-lg shadow font-semibold">
              Status: <span className="text-blue-600 uppercase">{gameState.status}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow font-semibold">
              Players: <span className="text-blue-600">{playersList.length}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Question Controls */}
            {gameState.status === 'question' && (
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" /> Kontrol Pertanyaan
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={handleLock}
                      disabled={gameState.isLocked}
                      className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm ${
                        gameState.isLocked 
                          ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200'
                      }`}
                    >
                      {gameState.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                      {gameState.isLocked ? 'Waktu Habis (Terkunci)' : 'Kunci Jawaban (Waktu Habis)'}
                    </button>
                    
                    <button 
                      onClick={handleRevealAll}
                      disabled={!gameState.isLocked}
                      className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm ${
                        !gameState.isLocked 
                          ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-2 border-yellow-200'
                      }`}
                    >
                      <Eye className="w-5 h-5" /> Buka Semua Jawaban
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reveal Satu Per Satu:</p>
                    <div className="flex gap-2">
                      <div className="flex-1 flex flex-col gap-2">
                        {gameState.questions[gameState.currentQuestionIndex]?.answers.slice(0, Math.ceil(gameState.questions[gameState.currentQuestionIndex]?.answers.length / 2)).map((ans: any, idx: number) => {
                          const originalIdx = idx;
                          return (
                            <button
                              key={originalIdx}
                              onClick={() => handleReveal(originalIdx)}
                              disabled={!gameState.isLocked || gameState.revealedAnswers.includes(originalIdx)}
                              className={`p-2 text-[10px] font-bold rounded-lg border-2 transition-all truncate ${
                                !gameState.isLocked
                                  ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                  : gameState.revealedAnswers.includes(originalIdx)
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                              title={ans.text}
                            >
                              {originalIdx + 1}. {ans.text}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        {gameState.questions[gameState.currentQuestionIndex]?.answers.slice(Math.ceil(gameState.questions[gameState.currentQuestionIndex]?.answers.length / 2)).map((ans: any, idx: number) => {
                          const originalIdx = idx + Math.ceil(gameState.questions[gameState.currentQuestionIndex]?.answers.length / 2);
                          return (
                            <button
                              key={originalIdx}
                              onClick={() => handleReveal(originalIdx)}
                              disabled={!gameState.isLocked || gameState.revealedAnswers.includes(originalIdx)}
                              className={`p-2 text-[10px] font-bold rounded-lg border-2 transition-all truncate ${
                                !gameState.isLocked
                                  ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                  : gameState.revealedAnswers.includes(originalIdx)
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                              title={ans.text}
                            >
                              {originalIdx + 1}. {ans.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Game Flow</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleStart}
                    disabled={gameState.status !== 'lobby'}
                    className={`font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm ${
                      gameState.status === 'lobby' 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'
                    }`}
                  >
                    <Play className="w-5 h-5" /> Start
                  </button>
                  <button 
                    onClick={handleReset}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <RotateCcw className="w-5 h-5" /> Reset
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={handleNext}
                    disabled={gameState.status === 'lobby'}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" /> Next Question
                  </button>
                  
                  {gameState.status === 'leaderboard' && (
                    <button 
                      onClick={handleShowQuestion}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" /> Back to Question
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-3 mt-4">
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <label className="text-sm font-semibold text-blue-800">Soal Penyisihan:</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="15" 
                      value={gameState.eliminationQuestionCount || 7} 
                      onChange={e => socket.emit('host_action', { action: 'update_elimination_question_count', payload: { eliminationQuestionCount: Number(e.target.value) } })} 
                      className="w-16 p-1 border border-blue-300 rounded text-center font-bold text-blue-900 focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <label className="text-sm font-semibold text-purple-800">Soal Final:</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="15" 
                      value={gameState.finalQuestionCount || 4} 
                      onChange={e => socket.emit('host_action', { action: 'update_final_question_count', payload: { finalQuestionCount: Number(e.target.value) } })} 
                      className="w-16 p-1 border border-purple-300 rounded text-center font-bold text-purple-900 focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <label className="text-sm font-semibold text-yellow-800">Jumlah Juara:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="20" 
                    value={gameState.winnerCount || 3} 
                    onChange={e => socket.emit('host_action', { action: 'update_winner_count', payload: { winnerCount: Number(e.target.value) } })} 
                    className="w-16 p-1 border border-yellow-300 rounded text-center font-bold text-yellow-900 focus:outline-none focus:border-yellow-500" 
                  />
                </div>
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <label className="text-sm font-semibold text-blue-800">Tampilkan di Leaderboard:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="50" 
                    value={gameState.leaderboardDisplayCount || 5} 
                    onChange={e => socket.emit('host_action', { action: 'update_leaderboard_display_count', payload: { leaderboardDisplayCount: Number(e.target.value) } })} 
                    className="w-16 p-1 border border-blue-300 rounded text-center font-bold text-blue-900 focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                  <label className="text-sm font-semibold text-green-800">Custom Link Lobby (Opsional):</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: bit.ly/teman-pelajar"
                    value={gameState.customLink || ''} 
                    onChange={e => socket.emit('host_action', { action: 'update_custom_link', payload: { customLink: e.target.value } })} 
                    className="w-full p-2 border border-green-300 rounded font-semibold text-green-900 focus:outline-none focus:border-green-500" 
                  />
                </div>
                <button 
                  onClick={handleLeaderboard}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Trophy className="w-5 h-5" /> Show Leaderboard
                </button>
                <button 
                  onClick={handleLobby}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" /> Back to Lobby
                </button>
              </div>

              {gameState.round === 'elimination' && (
                <div className="mt-6 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" /> Pengaturan Final
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-purple-800">Peserta Lolos Final:</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="20" 
                        value={gameState.finalistCount || 3} 
                        onChange={e => socket.emit('host_action', { action: 'update_finalist_count', payload: { finalistCount: Number(e.target.value) } })} 
                        className="w-20 p-2 border-2 border-purple-300 rounded-lg text-center font-bold text-purple-900 focus:outline-none focus:border-purple-500" 
                      />
                    </div>
                    {(() => {
                      const isEliminationComplete = 
                        gameState.round === 'elimination' && 
                        gameState.status === 'leaderboard' && 
                        gameState.currentQuestionIndex === (gameState.eliminationQuestionCount - 1);
                      const hasPlayers = playersList.length > 0;
                      const canStartFinal = isEliminationComplete && hasPlayers;

                      return (
                        <div className="space-y-2">
                          <button 
                            onClick={handleStartFinal} 
                            disabled={!canStartFinal}
                            className={`w-full font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 ${
                              canStartFinal 
                                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'
                            }`}
                          >
                            <Star className="w-5 h-5" /> Mulai Babak Final
                          </button>
                          {!canStartFinal && (
                            <p className="text-[10px] text-center text-purple-400 font-semibold italic">
                              {!hasPlayers 
                                ? '* Belum ada peserta yang bergabung' 
                                : '* Selesaikan semua soal penyisihan terlebih dahulu'}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Players ({playersList.length})</h2>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {playersList.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.branch}</p>
                      {gameState.round === 'final' && p.isFinalist && (
                        <span className="inline-block mt-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                          Finalist
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{p.score} pts</p>
                      {gameState.status === 'question' && (gameState.round === 'elimination' || p.isFinalist) && (
                        <span className={`text-xs px-2 py-1 rounded-full ${p.answeredCurrent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.answeredCurrent ? 'Answered' : 'Waiting'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Question & Answers */}
          <div className="lg:col-span-2">
            {gameState.status === 'question' ? (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        gameState.round === 'final' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {gameState.round === 'final' ? 'Babak Final' : 'Babak Penyisihan'}
                      </span>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Question {gameState.currentQuestionIndex + 1} of {gameState.questions.length}
                      </p>
                    </div>
                    <h2 className="text-2xl font-bold text-blue-900 mt-2">
                      {gameState.questions[gameState.currentQuestionIndex].question}
                    </h2>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-center">
                    <span className="block text-2xl">{answeredCount}</span>
                    <span className="text-xs uppercase">Answers</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {gameState.questions[gameState.currentQuestionIndex].answers.map((ans: any, idx: number) => {
                    const isRevealed = gameState.revealedAnswers.includes(idx);
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          isRevealed ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isRevealed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-lg">{ans.text}</p>
                            <p className="text-sm text-gray-500">Keywords: {ans.keywords.join(', ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-xl text-yellow-600">{ans.points} pts</span>
                          <button
                            onClick={() => handleReveal(idx)}
                            disabled={isRevealed}
                            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${
                              isRevealed 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            {isRevealed ? 'Revealed' : 'Reveal'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-md flex flex-col items-center justify-center text-center h-full border-4 border-dashed border-gray-200">
                <Trophy className="w-20 h-20 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-500 mb-2">Not in Question Mode</h2>
                <p className="text-gray-400">Click "Start Game" or "Next Question" to show the board controls.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
