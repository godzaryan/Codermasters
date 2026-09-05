"use client";

import { MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export interface ChatLog {
  sender: string;
  message: string;
  team: string;
  time: string;
  isGlobal?: boolean;
}

interface ChatPanelProps {
  logs: ChatLog[];
  onQuickChat: (msg: string) => void;
  onSend: (msg: string) => void;
}

export function ChatPanel({ logs, onQuickChat, onSend }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const quickChats = ["Nice one! 🔥", "Watch out! ⚠️", "Good Game 🤝", "Oops 😅"];

  const handleSend = () => {
    if (inputValue.trim()) {
      onSend(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="flex-1 min-h-[150px] bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl border-2 border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="w-full py-2 bg-white/5 border-b border-white/10 flex items-center justify-between px-3 shrink-0">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Game Log & Chat</span>
        <MessageSquare size={12} className="text-slate-400" />
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto scrollbar-thin">
        {logs.length === 0 ? (
          <div className="m-auto text-slate-600 text-xs font-bold">Waiting for players...</div>
        ) : (
          logs.map((log, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col gap-0.5 p-2 rounded-lg border ${log.isGlobal ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5'} ${!log.isGlobal && (log.team === 'red' ? 'border-l-2 border-l-rose-500' : log.team === 'blue' ? 'border-l-2 border-l-sky-500' : 'border-l-2 border-l-slate-400')}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${log.isGlobal ? 'text-amber-400' : log.team === 'red' ? 'text-rose-400' : log.team === 'blue' ? 'text-sky-400' : 'text-slate-400'}`}>
                  {log.sender}
                  {log.isGlobal && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[8px] tracking-widest">GLOBAL</span>}
                </span>
                <span className="text-[9px] text-slate-500">{log.time}</span>
              </div>
              <span className={`text-xs font-medium ${log.isGlobal ? 'text-amber-100' : 'text-slate-200'}`}>{log.message}</span>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Chat */}
      <div className="w-full p-2 border-t border-white/5 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickChats.map((msg) => (
            <button 
              key={msg}
              onClick={() => onQuickChat(msg)}
              className="shrink-0 text-[10px] font-bold tracking-wide px-3 py-1.5 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 cursor-pointer text-slate-300 transition-colors"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="relative shrink-0 p-2 pt-0">
        <input 
          type="text" 
          placeholder="Send a message..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-3 pr-10 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50" 
        />
        <button 
          onClick={handleSend}
          className="absolute right-4 top-1/2 -translate-y-[calc(50%+4px)] p-1 text-slate-400 hover:text-indigo-400 cursor-pointer"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
