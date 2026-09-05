"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Network } from "lucide-react";

export interface HistoryEntry {
  clue: string;
  number: number;
  team: string;
  guesses: {
    word: string;
    color: string;
    correct: boolean;
  }[];
}

interface PostGameRecapProps {
  isOpen: boolean;
  onClose: () => void;
  winner: "red" | "blue";
  history: HistoryEntry[];
}

export function PostGameRecap({ isOpen, onClose, winner, history }: PostGameRecapProps) {

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#1a1a1a] border-2 border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className={`w-full p-6 text-center border-b border-white/10 ${winner === 'red' ? 'bg-gradient-to-r from-red-900/50 to-red-800/50' : 'bg-gradient-to-r from-blue-900/50 to-blue-800/50'}`}>
              <h2 className="text-3xl font-black uppercase tracking-widest text-white drop-shadow-md">
                {winner === "red" ? "Red Team Wins!" : "Blue Team Wins!"}
              </h2>
              <p className="text-slate-300 text-sm mt-1 flex items-center justify-center gap-2">
                <Network size={16} /> Misunderstanding Recap
              </p>
            </div>

            {/* Content (The Graph/List) */}
            <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
              {history.map((turn, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
                  
                  {/* Clue Box */}
                  <div className={`px-4 py-2 rounded-lg font-black tracking-widest uppercase text-sm ${turn.team === 'red' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'}`}>
                    {turn.clue} - {turn.number}
                  </div>

                  {/* Connecting Line (simulated with CSS for now) */}
                  <div className="h-4 w-px md:w-8 md:h-px bg-white/20"></div>

                  {/* Guesses */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {turn.guesses.map((guess, j) => (
                      <div key={j} className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider ${guess.correct ? 'bg-white/10 text-white border border-white/20' : 'bg-black text-red-500 border border-red-500/50'}`}>
                        {guess.word} {guess.color === "black" && "(Assassin!)"}
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="w-full bg-black/20 p-4 flex justify-center border-t border-white/10">
              <button onClick={onClose} className="px-8 py-2 bg-white text-black font-black uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-colors">
                Return to Lobby
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
