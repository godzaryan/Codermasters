"use client";

import { UserCircle, Crown } from "lucide-react";
import { Player } from "@/hooks/useGameSocket";

interface TeamPanelProps {
  team: "red" | "blue";
  cardsLeft: number;
  phase: string;
  spymaster: Player | null;
  operatives: Player[];
  onJoin: (role: "spymaster" | "operative") => void;
}

export function TeamPanel({ team, cardsLeft, phase, spymaster, operatives, onJoin }: TeamPanelProps) {
  const isRed = team === "red";
  const bgClass = isRed 
    ? "bg-gradient-to-b from-[#a33b2a] to-[#6b2216] border-[#d9523a]" 
    : "bg-gradient-to-b from-[#1a4a6b] to-[#0f2c42] border-[#2b7ba8]";
  
  const textStrokeColor = isRed ? "#d9523a" : "#2b7ba8";

  return (
    <div className="w-full md:w-56 flex flex-col gap-4 h-full">
      {/* Operatives */}
      <div className={`${bgClass} rounded-2xl p-3 border-2 shadow-lg relative overflow-hidden group min-h-[128px] flex-1 flex flex-col`}>
        <div className={`absolute ${isRed ? 'right-0' : 'left-0'} bottom-0 opacity-20 transition-opacity`}>
          <UserCircle size={100} className={`${isRed ? 'translate-x-4' : '-translate-x-4'} translate-y-4 text-white`} />
        </div>
        <h3 className="text-center text-white font-black uppercase text-sm tracking-widest z-10 drop-shadow-md mb-2">Operatives</h3>
        
        <div className="z-10 flex flex-wrap justify-center gap-2 mb-auto">
          {operatives.map(op => (
            <div key={op.id} className="flex flex-col items-center">
              <div className="relative">
                <Crown size={14} className="text-amber-400 absolute -top-3 -left-3 rotate-[-20deg]" />
                <div className="w-8 h-8 rounded-full bg-black border-2 border-white/20 mb-1 overflow-hidden">
                  <div className="w-full h-full bg-slate-700"></div>
                </div>
              </div>
              <span className="text-white font-bold text-[10px] bg-black/40 px-2 py-0.5 rounded-full truncate max-w-[60px]">{op.name}</span>
            </div>
          ))}
        </div>

        <button onClick={() => onJoin("operative")} className="w-full py-2 bg-gradient-to-b from-green-400 to-green-600 rounded-lg text-white font-black text-[10px] uppercase tracking-widest shadow-lg border border-green-300 transition-all z-10 mt-2 hover:brightness-110 active:scale-95">
          Join Operatives
        </button>
      </div>

      {/* Cards Left Counter */}
      <div className="flex items-center justify-center gap-3">
        <span 
          className="text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-tighter" 
          style={{ WebkitTextStroke: `1px ${textStrokeColor}`}}
        >
          {phase === "lobby" ? "-" : cardsLeft}
        </span>
      </div>

      {/* Spymasters */}
      <div className={`${bgClass} rounded-2xl p-3 border-2 shadow-lg relative overflow-hidden group min-h-[128px] flex-1 flex flex-col`}>
        <div className={`absolute ${isRed ? 'left-0' : 'right-0'} bottom-0 opacity-20 transition-opacity`}>
          <UserCircle size={100} className={`${isRed ? '-translate-x-4' : 'translate-x-4'} translate-y-4 text-white`} />
        </div>
        <h3 className="text-center text-white font-black uppercase text-sm tracking-widest z-10 drop-shadow-md mb-2">Spymaster</h3>
        
        <div className="z-10 flex justify-center mb-auto">
          {spymaster ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-black border-2 border-white/20 mb-1 overflow-hidden">
                <div className="w-full h-full bg-slate-700"></div>
              </div>
              <span className="text-white font-bold text-xs bg-black/40 px-2 py-0.5 rounded-full truncate max-w-[80px]">{spymaster.name}</span>
            </div>
          ) : (
            <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-2">Waiting...</div>
          )}
        </div>

        <button onClick={() => onJoin("spymaster")} className="w-full py-2 bg-gradient-to-b from-green-400 to-green-600 rounded-lg text-white font-black text-[10px] uppercase tracking-widest shadow-lg border border-green-300 transition-all z-10 mt-2 hover:brightness-110 active:scale-95">
          Join Spymaster
        </button>
      </div>
    </div>
  );
}
