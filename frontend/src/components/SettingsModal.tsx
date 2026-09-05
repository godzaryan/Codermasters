"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Clock, BookOpen, Skull } from "lucide-react";

import { GameSettings } from "../hooks/useGameSocket";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  canEdit: boolean;
}

export function SettingsModal({ isOpen, onClose, settings, onUpdateSettings, canEdit }: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#2a1a1c] border-2 border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="w-full bg-black/20 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-black tracking-widest uppercase">
                <Settings size={18} className="text-slate-400" />
                Room Customizations
              </div>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-6">
              
              <div className={`flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 ${!canEdit ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400"><Clock size={20} /></div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Blitz Timer</h4>
                    <p className="text-xs text-slate-400">Strict turn time limits.</p>
                  </div>
                </div>
                <select 
                  value={settings.blitz_timer}
                  onChange={(e) => onUpdateSettings({ blitz_timer: parseInt(e.target.value) })}
                  disabled={!canEdit}
                  className="bg-black/40 text-xs text-white font-bold border border-white/10 rounded-lg px-2 py-1 outline-none cursor-pointer"
                >
                  <option value={0}>Off</option>
                  <option value={30}>30 Seconds</option>
                  <option value={60}>60 Seconds</option>
                  <option value={90}>90 Seconds</option>
                </select>
              </div>

              <div className={`flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 ${!canEdit ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><BookOpen size={20} /></div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Board Size</h4>
                    <p className="text-xs text-slate-400">5x5 or 6x6 grid.</p>
                  </div>
                </div>
                <select 
                  value={settings.board_size}
                  onChange={(e) => onUpdateSettings({ board_size: parseInt(e.target.value) })}
                  disabled={!canEdit}
                  className="bg-black/40 text-xs text-white font-bold border border-white/10 rounded-lg px-2 py-1 outline-none cursor-pointer"
                >
                  <option value={25}>5x5 (25 Cards)</option>
                  <option value={36}>6x6 (36 Cards)</option>
                </select>
              </div>

              <div className={`flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 ${!canEdit ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400"><Skull size={20} /></div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Forgiving Assassin</h4>
                    <p className="text-xs text-slate-400">-3 points instead of instant loss.</p>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdateSettings({ forgiving_assassin: !settings.forgiving_assassin })}
                  disabled={!canEdit}
                  className={`w-12 h-6 rounded-full relative transition-colors ${settings.forgiving_assassin ? 'bg-green-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${settings.forgiving_assassin ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              <div className={`flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 ${!canEdit ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400"><BookOpen size={20} /></div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Zero/Unlimited Clues</h4>
                    <p className="text-xs text-slate-400">Allow 0 or unlimited clue numbers.</p>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdateSettings({ zero_unlimited: !settings.zero_unlimited })}
                  disabled={!canEdit}
                  className={`w-12 h-6 rounded-full relative transition-colors ${settings.zero_unlimited ? 'bg-green-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${settings.zero_unlimited ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
