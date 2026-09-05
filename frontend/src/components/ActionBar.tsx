"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

interface ActionBarProps {
  role: "spymaster" | "operative" | "spectator";
  currentTurn: "red" | "blue";
  playerTeam?: "red" | "blue";
  currentClue?: string;
  currentNumber?: number;
  guessesRemaining?: number;
  turnStartTime?: number;
  blitzTimer?: number;
  onGiveClue: (word: string, number: number) => void;
  onEndTurn: () => void;
  onSendEmote?: (emoji: string) => void;
}

export function ActionBar({ role, currentTurn, playerTeam, currentClue, currentNumber, guessesRemaining, turnStartTime, blitzTimer, onGiveClue, onEndTurn, onSendEmote }: ActionBarProps) {
  const [clueWord, setClueWord] = useState("");
  const [clueNumber, setClueNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (blitzTimer && blitzTimer > 0 && turnStartTime) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() / 1000) - turnStartTime;
        const remaining = Math.max(0, blitzTimer - elapsed);
        setTimeLeft(remaining);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [turnStartTime, blitzTimer]);

  const isMyTurn = currentTurn === playerTeam;
  const hasActiveClue = !!currentClue;

  return (
    <div className="w-full flex flex-col items-center mt-6">
      <div className="text-center mb-4 flex items-center justify-center gap-2">
        <h2 className="text-white font-black text-lg tracking-widest uppercase drop-shadow-md">
          {currentTurn === "red" ? "Red Team's Turn" : "Blue Team's Turn"}
        </h2>
        {timeLeft !== null && (
          <div className="ml-2 bg-black/40 px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
            <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              {Math.ceil(timeLeft)}s
            </span>
          </div>
        )}
        <HelpCircle size={16} className="text-green-400 cursor-pointer hover:text-green-300 ml-2" />
      </div>

      <motion.div 
        layout
        className="flex items-center gap-3 bg-black/20 p-2 rounded-2xl border border-white/10"
      >
        {role === "spymaster" ? (
          <>
            <div className={`flex bg-black/40 rounded-xl p-1 border border-white/10 focus-within:border-sky-500/50 transition-colors ${(!isMyTurn || hasActiveClue) ? "opacity-50 pointer-events-none" : ""}`}>
              <input 
                type="text" 
                placeholder="Clue Word..." 
                value={clueWord}
                onChange={(e) => setClueWord(e.target.value)}
                disabled={!isMyTurn || hasActiveClue}
                className="w-32 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 uppercase font-bold tracking-wider" 
              />
              <div className="w-px bg-white/10 my-1 mx-1"></div>
              <select 
                value={clueNumber}
                onChange={(e) => setClueNumber(parseInt(e.target.value))}
                disabled={!isMyTurn || hasActiveClue}
                className="bg-transparent text-white text-sm font-bold px-2 py-2 outline-none cursor-pointer"
              >
                <option value={1} className="bg-slate-900">1</option>
                <option value={2} className="bg-slate-900">2</option>
                <option value={3} className="bg-slate-900">3</option>
                <option value={4} className="bg-slate-900">4</option>
                <option value={0} className="bg-slate-900">0</option>
              </select>
            </div>
            <button 
              onClick={() => {
                if (clueWord.trim()) {
                  onGiveClue(clueWord.trim(), clueNumber);
                  setClueWord("");
                }
              }}
              disabled={!isMyTurn || hasActiveClue || !clueWord.trim()}
              className="px-6 py-3 bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:from-slate-600 disabled:to-slate-700 disabled:text-white/50 text-white font-black tracking-widest text-sm rounded-xl shadow-lg transition-all border border-green-400/30 disabled:border-white/10 active:scale-95 uppercase"
            >
              Give Clue
            </button>
          </>
        ) : role === "operative" ? (
          <div className="flex items-center gap-4">
            {hasActiveClue && (
              <div className="flex flex-col items-start bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                <span className="text-white text-xs uppercase tracking-widest font-black opacity-60">Active Clue</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-lg uppercase tracking-wider">{currentClue}</span>
                  <span className="text-amber-400 font-bold text-sm bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">{currentNumber === 0 || currentNumber === 999 ? 'Unlimited' : currentNumber}</span>
                </div>
                <span className="text-white/70 text-xs mt-1 font-semibold">{guessesRemaining === 999 ? 'Unlimited' : guessesRemaining} guesses remaining</span>
              </div>
            )}
            <button 
              onClick={onEndTurn}
              disabled={!isMyTurn || !hasActiveClue}
              className="px-10 py-3 bg-gradient-to-b from-slate-100 to-slate-300 hover:from-white hover:to-slate-200 disabled:from-slate-700 disabled:to-slate-800 disabled:text-white/30 text-slate-900 font-black tracking-widest text-sm rounded-xl shadow-lg transition-all border border-white/20 disabled:border-white/5 active:scale-95 uppercase"
            >
              End Turn
            </button>
          </div>
        ) : role === "spectator" ? (
          <div className="flex items-center gap-4 px-4 py-1">
            <span className="text-white/50 text-xs font-black uppercase tracking-widest">Hype Board</span>
            <div className="flex gap-2">
              {['😱', '🤔', '💀', '🔥', '👀'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onSendEmote?.(emoji)}
                  className="text-2xl hover:scale-125 transition-transform active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
