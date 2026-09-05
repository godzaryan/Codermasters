"use client";

import { Users, Crown, Eye } from "lucide-react";
import { Player } from "@/hooks/useGameSocket";

interface PlayersPanelProps {
  players: Player[];
  clientId: string;
  hostId?: string;
}

export function PlayersPanel({ players, clientId, hostId }: PlayersPanelProps) {
  // Group players for better display
  const redPlayers = players.filter(p => p.team === "red");
  const bluePlayers = players.filter(p => p.team === "blue");
  const spectators = players.filter(p => p.team !== "red" && p.team !== "blue");

  const PlayerRow = ({ p }: { p: Player }) => (
    <div className={`flex items-center justify-between p-2 rounded-lg border bg-white/5 border-white/5 ${p.id === clientId ? 'border-indigo-500/50 bg-indigo-500/10' : ''}`}>
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white/10 ${p.team === 'red' ? 'bg-rose-500/20' : p.team === 'blue' ? 'bg-sky-500/20' : 'bg-slate-500/20'}`}>
          {p.role === 'spymaster' ? <Crown size={10} className={p.team === 'red' ? 'text-rose-400' : 'text-sky-400'} /> :
           p.role === 'spectator' ? <Eye size={10} className="text-slate-400" /> :
           <Users size={10} className={p.team === 'red' ? 'text-rose-400' : 'text-sky-400'} />}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white flex items-center gap-1">
            {p.name}
            {p.id === clientId && <span className="text-[8px] bg-indigo-500/30 text-indigo-300 px-1 rounded">YOU</span>}
            {p.id === hostId && <span className="text-[8px] bg-amber-500/30 text-amber-300 px-1 rounded">HOST</span>}
          </span>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest">{p.role}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        {p.ping !== undefined && (
          <span className={`text-[8px] font-bold uppercase tracking-wider ${p.ping < 100 ? 'text-green-400' : p.ping < 250 ? 'text-yellow-400' : 'text-red-400'}`}>
            {p.ping}ms
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-[150px] bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl border-2 border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="w-full py-2 bg-white/5 border-b border-white/10 flex items-center justify-between px-3 shrink-0">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Players List</span>
        <Users size={12} className="text-slate-400" />
      </div>
      
      {/* Players List */}
      <div className="flex-1 p-3 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
        {players.length === 0 ? (
          <div className="m-auto text-slate-600 text-xs font-bold">No players...</div>
        ) : (
          <>
            {redPlayers.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Red Team</span>
                {redPlayers.map(p => <PlayerRow key={p.id} p={p} />)}
              </div>
            )}
            
            {bluePlayers.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Blue Team</span>
                {bluePlayers.map(p => <PlayerRow key={p.id} p={p} />)}
              </div>
            )}

            {spectators.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Spectators</span>
                {spectators.map(p => <PlayerRow key={p.id} p={p} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
