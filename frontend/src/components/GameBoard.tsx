"use client";

import { motion } from "framer-motion";
import { EyeOff } from "lucide-react";

interface GameBoardProps {
  words: string[];
  colors: string[];
  guessed: boolean[];
  role: "spymaster" | "operative";
  currentTurn?: "red" | "blue";
  hasActiveClue?: boolean;
  playerTeam?: "red" | "blue" | "spectator";
  onCardClick: (index: number) => void;
}

export function GameBoard({ words, colors, guessed, role, currentTurn, hasActiveClue, playerTeam, onCardClick }: GameBoardProps) {
  const isMyTurn = currentTurn === playerTeam;
  const canGuess = role === "operative" && isMyTurn && hasActiveClue;

  const getColorClass = (color: string, isGuessed: boolean) => {
    if (role === "operative" && !isGuessed) {
      return "bg-gradient-to-b from-[#f2dac3] to-[#e4c4a6] border-[#b89576] text-[#5a3a22] hover:bg-white";
    }

    switch (color) {
      case "red":
        return "bg-gradient-to-b from-rose-500 to-rose-600 border-rose-700 text-white shadow-rose-900";
      case "blue":
        return "bg-gradient-to-b from-sky-500 to-sky-600 border-sky-700 text-white shadow-sky-900";
      case "black":
        return "bg-gradient-to-b from-neutral-800 to-neutral-900 border-black text-neutral-200 shadow-black";
      case "neutral":
      default:
        return "bg-gradient-to-b from-[#f2dac3] to-[#e4c4a6] border-[#b89576] text-[#5a3a22] shadow-[#a38062]";
    }
  };

  return (
    <div className={`grid ${words.length === 36 ? 'grid-cols-6' : 'grid-cols-5'} gap-2 sm:gap-3 w-full h-full mx-auto`}>
      {words.map((word, i) => (
        <motion.button
          key={i}
          onClick={() => {
            if (canGuess && !guessed[i]) {
              onCardClick(i);
            }
          }}
          whileTap={canGuess && !guessed[i] ? { scale: 0.95, y: 2 } : {}}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: i * 0.02 }}
          className={`
            w-full h-full rounded-lg border-b-4 flex items-center justify-center 
            font-black tracking-widest text-[10px] sm:text-xs md:text-[13px] uppercase
            transition-all shadow-md px-1 relative overflow-hidden group
            ${getColorClass(colors[i], guessed[i])}
            ${guessed[i] ? "opacity-60 scale-95 border-b-0 translate-y-1" : ""}
            ${!canGuess && !guessed[i] ? "cursor-default hover:brightness-100" : "cursor-pointer"}
          `}
          disabled={guessed[i] || !canGuess}
        >
          {role === "spymaster" && !guessed[i] && (
            <div className="absolute top-1 right-1 opacity-40">
              <EyeOff size={10} className="sm:w-3 sm:h-3" />
            </div>
          )}
          <span className="truncate w-full text-center relative z-10 drop-shadow-sm">{word}</span>
          
          {guessed[i] && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]"
            >
              <div className="w-full h-0.5 bg-black/40 rotate-45 absolute rounded-full"></div>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

