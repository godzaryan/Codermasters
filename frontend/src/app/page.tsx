"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Lock, Search, Loader2 } from "lucide-react";
import { getApiUrls } from "@/lib/config";

interface ServerRoom {
  room_id: string;
  name: string;
  player_count: number;
  created_at: number;
}

export default function LandingPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState<{ isOpen: boolean, isPublic: boolean }>({ isOpen: false, isPublic: false });
  const [showServerBrowser, setShowServerBrowser] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [serverList, setServerList] = useState<ServerRoom[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const matchmakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (matchmakingTimeoutRef.current) clearTimeout(matchmakingTimeoutRef.current);
    };
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameToUse = roomName.trim().length > 0 ? roomName.trim() : "CodeMasters Operation";
    const endpoint = showCreateModal.isPublic ? "/api/rooms/public" : "/api/rooms/private";
    try {
      const { api } = getApiUrls();
      const res = await fetch(`${api}${endpoint}`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameToUse })
      });
      const data = await res.json();
      router.push(`/room/${data.room_id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create room.");
    }
  };

  const fetchServers = async () => {
    setIsLoadingServers(true);
    try {
      const { api } = getApiUrls();
      const res = await fetch(`${api}/api/rooms/public`);
      if (res.ok) {
        const data = await res.json();
        setServerList(data.rooms);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoadingServers(false);
  };

  const openServerBrowser = () => {
    setShowServerBrowser(true);
    fetchServers();
  };

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length > 0) {
      router.push(`/room/${joinCode.trim().toUpperCase()}`);
    }
  };

  const pollForMatch = async () => {
    try {
      const { api } = getApiUrls();
      const res = await fetch(`${api}/api/rooms/public/join`);
      if (res.ok) {
        const data = await res.json();
        router.push(`/room/${data.room_id}`);
      } else {
        // If no match found, retry after 2 seconds
        matchmakingTimeoutRef.current = setTimeout(pollForMatch, 2000);
      }
    } catch (err) {
      console.error(err);
      setIsMatchmaking(false);
      alert("Failed to connect to matchmaking server.");
    }
  };

  const handleFindMatch = () => {
    setIsMatchmaking(true);
    pollForMatch();
  };

  const cancelMatchmaking = () => {
    setIsMatchmaking(false);
    if (matchmakingTimeoutRef.current) {
      clearTimeout(matchmakingTimeoutRef.current);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full font-sans flex flex-col items-center justify-center relative">

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6 py-12">
        <div className="text-center mb-12 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="absolute -inset-10 bg-rose-500/10 blur-3xl rounded-full"
          ></motion.div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase drop-shadow-2xl relative z-10">
            Code<span className="text-amber-400">Masters</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium tracking-wide uppercase text-sm">Tactical Espionage Action</p>
        </div>

        {isMatchmaking ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-6 shadow-2xl"
          >
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
            <div className="text-center">
              <h2 className="text-white font-bold text-xl uppercase tracking-widest mb-2">Searching...</h2>
              <p className="text-slate-400 text-sm">Finding operatives for public match</p>
            </div>
            <button 
              onClick={cancelMatchmaking}
              className="mt-4 px-6 py-2 rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            <button 
              onClick={handleFindMatch}
              className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-b from-amber-400 to-amber-600 p-4 rounded-2xl text-amber-950 font-black text-lg uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(251,191,36,0.5)] border border-amber-300 transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <Search className="w-6 h-6" />
              Find Match
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-white/30 text-xs font-bold uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal({ isOpen: true, isPublic: true })}
                className="flex-1 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 p-4 rounded-2xl border border-indigo-400/50 shadow-[0_0_20px_-10px_rgba(99,102,241,0.5)] transition-all active:scale-95 text-white"
              >
                <Users className="w-6 h-6" />
                <span className="font-bold text-sm uppercase tracking-wider">Host Public</span>
              </button>
              
              <button 
                onClick={openServerBrowser}
                className="flex-1 flex flex-col items-center justify-center gap-2 bg-black/40 hover:bg-black/60 p-4 rounded-2xl border border-white/10 transition-all hover:border-white/20 active:scale-95"
              >
                <Search className="w-6 h-6 text-emerald-400" />
                <span className="text-white font-bold text-sm uppercase tracking-wider">Browse Servers</span>
              </button>
            </div>

            <button 
              onClick={() => setShowCreateModal({ isOpen: true, isPublic: false })}
              className="w-full flex items-center justify-center gap-2 bg-black/40 hover:bg-black/60 p-4 rounded-2xl border border-white/10 transition-all hover:border-white/20 active:scale-95"
            >
              <Lock className="w-5 h-5 text-sky-400" />
              <span className="text-white font-bold text-sm uppercase tracking-wider">Create Private Match</span>
            </button>

            <form onSubmit={handleJoinWithCode} className="mt-4 flex bg-black/40 rounded-2xl border border-white/10 p-1 focus-within:border-amber-400/50 transition-colors">
              <div className="flex items-center justify-center pl-4">
                <Users className="w-5 h-5 text-slate-500" />
              </div>
              <input 
                type="text" 
                placeholder="ROOM CODE" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 bg-transparent text-white px-4 py-3 outline-none font-bold placeholder:text-slate-600 tracking-[0.2em] uppercase"
              />
              <button 
                type="submit"
                disabled={joinCode.length < 3}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 text-white px-6 rounded-xl font-bold uppercase tracking-wider transition-colors text-sm"
              >
                Join
              </button>
            </form>
          </div>
        )}
      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateModal.isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a0f12] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
          >
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-1">
              {showCreateModal.isPublic ? "Public Match" : "Private Match"}
            </h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-6">Set your lobby name</p>
            
            <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
              <input 
                type="text" 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="CodeMasters Operation"
                maxLength={24}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-indigo-500/50 transition-colors"
                autoFocus
              />
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal({ isOpen: false, isPublic: false })}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 py-3 rounded-xl text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-indigo-900/20"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* SERVER BROWSER MODAL */}
      {showServerBrowser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a0f12] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-widest">Server Browser</h2>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Active Public Matches</p>
              </div>
              <button 
                onClick={() => setShowServerBrowser(false)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 min-h-[200px]">
              {isLoadingServers ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
              ) : serverList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <Search className="w-12 h-12 mb-2 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-sm">No Active Servers</p>
                  <p className="text-xs mt-1">Host one to get started!</p>
                </div>
              ) : (
                serverList.map((server) => (
                  <div key={server.room_id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:border-indigo-500/30 transition-colors">
                    <div>
                      <h3 className="text-white font-bold tracking-wide truncate max-w-[150px] md:max-w-[200px]">{server.name}</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                        {/* eslint-disable-next-line react-hooks/purity */}
                        Code: <span className="text-amber-400">{server.room_id}</span> • Age: {Math.floor((new Date().getTime()/1000 - server.created_at) / 60)}m
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white/50 text-sm font-bold bg-white/5 px-2 py-1 rounded">{server.player_count}/6</span>
                      <button 
                        onClick={() => router.push(`/room/${server.room_id}`)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs tracking-wider transition-colors"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={fetchServers}
              className="w-full mt-4 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
            >
              Refresh List
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}
