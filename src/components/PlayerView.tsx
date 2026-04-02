import { useState, FormEvent, useEffect } from 'react';
import { socket } from '../socket';
import { GameState } from '../App';
import { Send, User, MapPin, Lock } from 'lucide-react';
import { motion } from 'motion/react';

const Logo = ({ small = false }: { small?: boolean }) => (
  <div className={`flex flex-col items-center justify-center ${small ? 'scale-60 mb-2' : 'scale-90 mb-10'} transition-transform`}>
    <div className="bg-yellow-400 text-blue-900 font-black text-4xl px-10 py-4 rounded-2xl shadow-[0_6px_0_0_rgba(180,83,9,1)] transform -rotate-2">
      FAMILY
    </div>
    <div className="bg-white text-blue-900 font-black text-2xl px-8 py-3 rounded-2xl shadow-[0_4px_0_0_rgba(156,163,175,1)] transform rotate-2 -mt-3 ml-8">
      TEMAN PELAJAR
    </div>
  </div>
);

export default function PlayerView({ gameState }: { gameState: GameState }) {
  const [answer, setAnswer] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Generate or retrieve a persistent player ID
  const [playerId] = useState(() => {
    let id = localStorage.getItem('teman_pelajar_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('teman_pelajar_id', id);
    }
    return id;
  });

  const [name, setName] = useState(() => localStorage.getItem('teman_pelajar_name') || '');
  const [branch, setBranch] = useState(() => localStorage.getItem('teman_pelajar_branch') || '');
  const [joined, setJoined] = useState(() => !!localStorage.getItem('teman_pelajar_name'));

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      // Auto-rejoin if we already have credentials
      if (joined && name && branch) {
        socket.emit('join', { id: playerId, name, branch });
      }
    };
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // If already connected when component mounts, trigger auto-join
    if (socket.connected && joined && name && branch) {
      socket.emit('join', { id: playerId, name, branch });
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [playerId, name, branch, joined]);

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (name && branch && isConnected) {
      localStorage.setItem('teman_pelajar_name', name);
      localStorage.setItem('teman_pelajar_branch', branch);
      socket.emit('join', { id: playerId, name, branch });
      setJoined(true);
    }
  };

  const handleSubmitAnswer = (e: FormEvent) => {
    e.preventDefault();
    if (answer.trim() && isConnected) {
      socket.emit('submit_answer', { id: playerId, answer });
      setAnswer('');
    }
  };

  const player = gameState.players[playerId];

  if (!joined || !player) {
    return (
      <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4 text-white">
        <Logo />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white text-blue-900 p-8 rounded-2xl shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-blue-600">Silakan Isi Data Untuk Ikut Bermain</h2>
          </div>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Asal Cabang</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Cabang Depok"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={!isConnected}
              className={`w-full font-bold py-3 rounded-lg transition-colors shadow-md ${
                isConnected ? 'bg-yellow-500 hover:bg-yellow-400 text-blue-900' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
              }`}
            >
              {isConnected ? 'Mulai Bermain!' : 'Menghubungkan...'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (gameState.round === 'final' && !player.isFinalist) {
    return (
      <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4 text-white text-center">
        <Logo small />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white text-blue-900 p-8 rounded-2xl shadow-2xl w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Babak Final Dimulai!</h2>
          <p className="text-gray-600">Maaf, Anda tidak lolos ke babak final. Terima kasih sudah berpartisipasi!</p>
          <p className="mt-4 font-bold text-blue-600 text-xl">Skor Akhir Anda: {player.score}</p>
        </motion.div>
      </div>
    );
  }

  if (gameState.status === 'lobby') {
    return (
      <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4 text-white text-center">
        <Logo />
        <motion.div
          className="mt-4"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <h2 className="text-3xl font-bold mb-4">Halo, {player.name}!</h2>
          <p className="text-xl text-blue-200">Bersiaplah, permainan akan segera dimulai...</p>
          <p className="mt-4 text-sm text-blue-300">Perhatikan layar Zoom untuk melihat papan permainan.</p>
        </motion.div>
      </div>
    );
  }

  if (gameState.status === 'question') {
    const currentQ = gameState.questions[gameState.currentQuestionIndex];
    
    if (player.answeredCurrent || gameState.isLocked) {
      return (
        <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4 text-white text-center">
          <Logo small />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-6"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${gameState.isLocked && !player.answeredCurrent ? 'bg-red-500' : 'bg-green-500'}`}>
              {gameState.isLocked && !player.answeredCurrent ? <Lock className="w-10 h-10 text-white" /> : <Send className="w-10 h-10 text-white" />}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {player.answeredCurrent ? 'Jawaban Tersimpan!' : 'Waktu Habis!'}
            </h2>
            <p className="text-xl text-blue-200">
              {player.answeredCurrent 
                ? 'Lihat layar Zoom untuk mengetahui apakah jawabanmu ada di papan family teman pelajar.'
                : 'Maaf, waktu untuk menjawab pertanyaan ini sudah habis.'}
            </p>
            <div className="mt-8 p-4 bg-blue-800 rounded-xl inline-block">
              <p className="text-sm text-blue-300">Skor Kamu Saat Ini</p>
              <p className="text-4xl font-bold text-yellow-400">{player.score}</p>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4 text-white">
        <Logo small />
        <div className="w-full max-w-md mt-2">
          <div className="bg-blue-800 p-6 rounded-2xl shadow-xl mb-6 text-center">
            <p className="text-sm text-yellow-400 font-bold mb-2 uppercase tracking-wider">Pertanyaan {gameState.currentQuestionIndex + 1}</p>
            <h2 className="text-xl font-semibold leading-relaxed">{currentQ.question}</h2>
          </div>
          
          <form onSubmit={handleSubmitAnswer} className="bg-white p-6 rounded-2xl shadow-xl">
            <label className="block text-blue-900 font-bold mb-4 text-center">Apa tebakanmu?</label>
            <input 
              type="text" 
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-blue-900 text-lg text-center font-medium mb-4"
              placeholder="Ketik jawaban di sini..."
              autoFocus
              required
            />
            <button 
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-4 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 text-lg"
            >
              <Send className="w-5 h-5" />
              Kirim Jawaban
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (gameState.status === 'leaderboard') {
    const winnerCount = gameState.winnerCount || 3;
    const sortedPlayers = Object.values(gameState.players).sort((a, b) => b.score - a.score).slice(0, winnerCount);
    const isWinner = sortedPlayers.some(p => p.id === player.id);
    const rank = sortedPlayers.findIndex(p => p.id === player.id) + 1;

    return (
      <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4 text-white text-center">
        <Logo small />
        <div className="mt-4">
          {isWinner ? (
          <>
            <h2 className="text-4xl font-bold mb-4 text-yellow-400">Selamat!</h2>
            <p className="text-2xl mb-8">Kamu Juara {rank} dengan skor <span className="font-bold">{player.score}</span></p>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold mb-4 text-yellow-400">Permainan Selesai!</h2>
            <p className="text-2xl mb-8">Skor Akhir Kamu: <span className="font-bold">{player.score}</span></p>
          </>
        )}
        <p className="text-lg text-blue-200">Lihat layar Zoom untuk mengetahui daftar juaranya!</p>
        </div>
      </div>
    );
  }

  return null;
}
