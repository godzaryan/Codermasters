import { useState, useEffect, useRef } from "react";
import { getApiUrls } from "@/lib/config";

export interface Player {
  id: string;
  name: string;
  team: string;
  role: string;
  ping?: number;
}

export interface Card {
  word: string;
  color: string;
  revealed: boolean;
}

export interface GameSettings {
  blitz_timer: number;
  word_pack: string;
  custom_words: string[];
  forgiving_assassin: boolean;
  board_size: number;
  zero_unlimited: boolean;
}

export interface GameState {
  room_name?: string;
  host_id?: string;
  players: Record<string, Player>;
  cards: Card[];
  settings: GameSettings;
  turn_start_time?: number;
  current_turn: string;
  phase: string;
  current_clue?: string;
  current_number?: number;
  guesses_remaining?: number;
  winner?: string;
  red_score: number;
  blue_score: number;
  history: { clue: string; number: number; team: string; guesses: { word: string; color: string; correct: boolean }[] }[];
}

export interface UseGameSocketProps {
  roomId: string;
  clientId: string;
  playerName: string;
  onHostDisconnected?: () => void;
  onSessionOverridden?: () => void;
}

export function useGameSocket({ roomId, clientId, playerName, onHostDisconnected, onSessionOverridden }: UseGameSocketProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [chatLogs, setChatLogs] = useState<{ sender: string; message: string; team: string; time: string; isGlobal?: boolean }[]>([]);
  const [emotes, setEmotes] = useState<{ id: string; emoji: string; sender: string }[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const onHostDisconnectedRef = useRef(onHostDisconnected);
  const onSessionOverriddenRef = useRef(onSessionOverridden);

  useEffect(() => {
    onHostDisconnectedRef.current = onHostDisconnected;
    onSessionOverriddenRef.current = onSessionOverridden;
  }, [onHostDisconnected, onSessionOverridden]);

  useEffect(() => {
    if (!roomId || !clientId || !playerName) return;

    // Retrieve or generate Device ID
    let deviceId = localStorage.getItem("codemasters_device_id");
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("codemasters_device_id", deviceId);
    }

    const { ws: wsBaseUrl } = getApiUrls();
    const wsUrl = `${wsBaseUrl}/ws/${roomId}/${clientId}?name=${encodeURIComponent(playerName)}&deviceId=${deviceId}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => setConnected(true);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        const latency = Date.now() - data.timestamp;
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: "update_ping", ping: latency }));
        }
        return;
      }
      if (data.type === "session_override") {
        if (onSessionOverriddenRef.current) onSessionOverriddenRef.current();
        ws.close(4001);
        return;
      }
      if (data.type === "host_disconnected") {
        if (onHostDisconnectedRef.current) onHostDisconnectedRef.current();
        ws.close(4000);
        return;
      }
      if (data.type === "state_update") {
        setGameState(data.state);
      } else if (data.type === "chat_message") {
        setChatLogs(prev => [...prev, data.message].slice(-50));
      } else if (data.type === "emote") {
        const emote = { id: Math.random().toString(36).substr(2, 9), emoji: data.emoji, sender: data.sender };
        setEmotes(prev => [...prev, emote].slice(-50));
        setTimeout(() => {
          setEmotes(prev => prev.filter(e => e.id !== emote.id));
        }, 3000);
      }
    };

    ws.onclose = (event) => {
      setConnected(false);
      if (event.code === 4001) {
        if (onSessionOverriddenRef.current) onSessionOverriddenRef.current();
        return;
      }
      if (event.code === 4000) {
        if (onHostDisconnectedRef.current) onHostDisconnectedRef.current();
      }
    };

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "ping", timestamp: Date.now() }));
      }
    }, 5000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [roomId, clientId, playerName]);

  const joinTeam = (team: "red" | "blue" | "spectator", role: "spymaster" | "operative" | "spectator") => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        action: "join_team",
        team,
        role
      }));
    }
  };

  const startGame = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: "start_game" }));
    }
  };

  const giveClue = (word: string, number: number) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: "give_clue", word, number }));
    }
  };

  const guessCard = (index: number) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: "guess_card", index }));
    }
  };

  const endTurn = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: "end_turn" }));
    }
  };

  const updateSettings = (settings: Partial<GameSettings>) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: "update_settings", settings }));
    }
  };

  const sendChat = (message: string, isGlobal: boolean = false) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: "chat", message, is_global: isGlobal }));
    }
  };

  const sendEmote = (emoji: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: "emote", emoji }));
    }
  };

  return { gameState, connected, chatLogs, emotes, joinTeam, startGame, giveClue, guessCard, endTurn, sendChat, sendEmote, updateSettings };
}
