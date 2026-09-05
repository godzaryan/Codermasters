"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Server, ArrowRight, Settings, Volume2, VolumeX } from "lucide-react";
import { GameBoard } from "@/components/GameBoard";
import { ActionBar } from "@/components/ActionBar";
import { TeamPanel } from "@/components/TeamPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { PlayersPanel } from "@/components/PlayersPanel";
import { SettingsModal } from "@/components/SettingsModal";
import { PostGameRecap } from "@/components/PostGameRecap";
import { useGameSocket } from "@/hooks/useGameSocket";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function GameUI() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [hostLeft, setHostLeft] = useState(false);
  const [sessionOverridden, setSessionOverridden] = useState(false);

  // WebSocket Integration
  const [clientId, setClientId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  
  useEffect(() => {
    if (!clientId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClientId(Math.random().toString(36).substring(2, 9));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const { gameState, connected, chatLogs, emotes, joinTeam, startGame, giveClue, guessCard, endTurn, sendChat, sendEmote, updateSettings } = useGameSocket({
    roomId: hasJoined ? roomId : "", 
    clientId: hasJoined ? clientId : "",
    playerName: hasJoined ? playerName : "",
    onHostDisconnected: () => setHostLeft(true),
    onSessionOverridden: () => setSessionOverridden(true)
  });

  useEffect(() => {
    if (gameState?.phase === "game_over" && !showRecap) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowRecap(true);
      // Trigger confetti with winning team colors
      const colors = gameState.winner === "red" ? ["#ef4444", "#991b1b"] : ["#3b82f6", "#1e40af"];
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors,
      });
    } else {
      setShowRecap(false);
    }
  }, [gameState?.phase, gameState?.winner, showRecap]);

  // Derived State
  const players = gameState ? Object.values(gameState.players) : [];
  const me = players.find(p => p.id === clientId);
  const myRole = me?.role || "spectator";

  const redSpymaster = players.find(p => p.team === "red" && p.role === "spymaster") || null;
  const redOperatives = players.filter(p => p.team === "red" && p.role === "operative");
  
  const blueSpymaster = players.find(p => p.team === "blue" && p.role === "spymaster") || null;
  const blueOperatives = players.filter(p => p.team === "blue" && p.role === "operative");

  const cards = gameState?.cards || [];
  const words = cards.map(c => c.word);
  const colors = cards.map(c => c.color);
  const guessed = cards.map(c => c.revealed);

  if (!hasJoined) {
    return (
      <main className="min-h-[100dvh] w-full font-sans flex items-center justify-center relative p-4">

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col items-center max-w-md w-full shadow-2xl mx-4"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Server className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2 text-center">Join Room</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-8 text-center bg-white/5 py-1 px-3 rounded-full">
            Room Code: <span className="text-amber-400">{roomId}</span>
          </p>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (playerName.trim().length >= 2) setHasJoined(true);
            }} 
            className="w-full flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Codename / Display Name</label>
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Agent 47..." 
                maxLength={12}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-indigo-500/50 transition-colors"
                autoFocus
              />
            </div>
            
            <button 
              type="submit"
              disabled={playerName.trim().length < 2}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
            >
              Enter Room <ArrowRight size={16} />
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] w-full font-sans flex flex-col relative">

      {/* Floating Emotes Layer */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {emotes.map((emote) => {
            return (
              <motion.div
                key={emote.id}
                initial={{ opacity: 0, y: 100, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], y: -300, scale: [0.5, 1.5, 1.5, 0.8] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                className="absolute bottom-1/4 left-1/2 text-5xl md:text-6xl drop-shadow-xl"
              >
                {emote.emoji}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Top Navbar */}
      <nav className="relative z-20 w-full p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-1.5 border border-white/10 max-w-[200px] md:max-w-none overflow-hidden">
            <span className="font-bold text-white text-sm tracking-wide truncate">{gameState?.room_name || "CodeMasters Operation"}</span>
            <span className="text-amber-400 font-black text-sm shrink-0">| {roomId}</span>
          </div>
          
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${connected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            <Server size={14} />
            {connected ? "Connected" : "Reconnecting..."}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full border border-white/10 transition-colors"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white rounded-full px-4 py-1.5 border border-white/10 text-xs font-bold transition-colors"
          >
            <Settings size={14} /> Settings
          </button>
        </div>
      </nav>

      {/* Main Game Area */}
      <div className="flex-1 w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 relative z-10 min-h-0 overflow-x-auto">
        
        {/* FAR LEFT COLUMN: Players List (Resizable) */}
        <div className="w-full md:w-72 min-w-[250px] max-w-[500px] flex flex-col min-h-0 resize-x overflow-hidden bg-black/10 rounded-2xl border-white/5 border p-1 shrink-0" style={{ direction: 'rtl' }}>
          <div style={{ direction: 'ltr', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <PlayersPanel players={players} clientId={clientId} hostId={gameState?.host_id} />
          </div>
        </div>

        {/* LEFT COLUMN: Blue Team */}
        <TeamPanel 
          team="blue" 
          cardsLeft={gameState?.blue_score ?? 8}
          phase={gameState?.phase || "lobby"} 
          spymaster={blueSpymaster} 
          operatives={blueOperatives} 
          onJoin={(role) => joinTeam("blue", role)} 
        />

        {/* CENTER COLUMN: The Board & Controls */}
        <div className="flex-1 flex flex-col relative z-20">
          {gameState?.phase === "lobby" ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-black/40 border border-white/10 p-8 rounded-2xl flex flex-col items-center gap-4 text-center backdrop-blur-md">
                <h2 className="text-white text-2xl font-black uppercase tracking-widest">Waiting for Players</h2>
                <p className="text-slate-400 text-sm max-w-sm">
                  Join a team and select your role. Once everyone is ready, start the game.
                </p>
                {myRole !== "spectator" && (
                  <button 
                    onClick={startGame}
                    className="mt-4 px-8 py-3 bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black tracking-widest text-sm rounded-xl shadow-lg transition-all border border-green-400/30 active:scale-95 uppercase"
                  >
                    Start Game
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <GameBoard 
                words={words} 
                colors={colors} 
                guessed={guessed} 
                role={myRole as "spymaster" | "operative"} 
                onCardClick={guessCard} 
                currentTurn={gameState?.current_turn as "red" | "blue" | undefined}
                hasActiveClue={!!gameState?.current_clue}
                playerTeam={me?.team as "red" | "blue" | "spectator" | undefined}
              />
              <ActionBar 
                role={myRole as "spymaster" | "operative" | "spectator"} 
                currentTurn={gameState?.current_turn as "red" | "blue" || "red"}
                playerTeam={me?.team as "red" | "blue"}
                currentClue={gameState?.current_clue}
                currentNumber={gameState?.current_number}
                guessesRemaining={gameState?.guesses_remaining}
                turnStartTime={gameState?.turn_start_time}
                blitzTimer={gameState?.settings.blitz_timer}
                onGiveClue={giveClue} 
                onEndTurn={endTurn}
                onSendEmote={sendEmote}
              />
            </>
          )}
        </div>

        {/* RIGHT COLUMN: Red Team */}
        <TeamPanel 
          team="red" 
          cardsLeft={gameState?.red_score ?? 9} 
          phase={gameState?.phase || "lobby"}
          spymaster={redSpymaster} 
          operatives={redOperatives} 
          onJoin={(role) => joinTeam("red", role)} 
        />
        
        {/* FAR RIGHT COLUMN: Chat (Resizable) */}
        <div className="w-full md:w-72 min-w-[250px] max-w-[500px] flex flex-col min-h-0 resize-x overflow-hidden bg-black/10 rounded-2xl border-white/5 border p-1 shrink-0">
          <ChatPanel 
            logs={chatLogs} 
            onQuickChat={(msg) => sendChat(msg, myRole === "spymaster")} 
            onSend={(msg) => sendChat(msg, false)} 
          />
        </div>

      </div>

      {/* Modals */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        settings={gameState?.settings || { blitz_timer: 0, word_pack: "Classic English", custom_words: [], forgiving_assassin: false, board_size: 25, zero_unlimited: true }}
        onUpdateSettings={updateSettings}
        canEdit={gameState?.phase === "lobby"}
      />
      <PostGameRecap isOpen={showRecap} onClose={() => setShowRecap(false)} winner={(gameState?.winner as "red" | "blue") || "blue"} history={gameState?.history || []} />

      {/* Host Disconnected Modal */}
      {hostLeft && !sessionOverridden && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a0f12] border border-red-500/30 rounded-3xl p-8 w-full max-w-md shadow-2xl relative flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <Server className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">
              Lobby Disbanded
            </h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-8">
              The host has left the operation. The room has been closed.
            </p>
            <button 
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 py-4 rounded-xl text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_-10px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2"
            >
              <ArrowRight size={20} />
              Return to Base
            </button>
          </motion.div>
        </div>
      )}

      {/* Session Overridden Modal */}
      {sessionOverridden && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a0f12] border border-indigo-500/30 rounded-3xl p-8 w-full max-w-md shadow-2xl relative flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
              <Server className="w-10 h-10 text-indigo-500" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">
              Session Transferred
            </h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-8">
              You opened CodeMasters in another tab or window. This instance has been securely disconnected.
            </p>
            <button 
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 py-4 rounded-xl text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2"
            >
              <ArrowRight size={20} />
              Return to Base
            </button>
          </motion.div>
        </div>
      )}

    </main>
  );
}
