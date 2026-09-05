import asyncio
import time
from fastapi import WebSocket
from typing import Dict
from models.state import GameState
from core.game_engine import generate_board
from core.security import RateLimiter, ProfanityFilter

class Room:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.game_state = GameState()
        self.timer_task = None
        self.is_public = False
        self.created_at = time.time()
        self.host_id = None

class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, Room] = {}
        self.rate_limiters: Dict[str, RateLimiter] = {}
        self.profanity_filter = ProfanityFilter()
        # Maps device_id -> (room_id, client_id, websocket)
        self.device_sessions: Dict[str, tuple[str, str, WebSocket]] = {}

    def get_room(self, room_id: str) -> Room:
        if room_id not in self.rooms:
            self.rooms[room_id] = Room()
        return self.rooms[room_id]

    async def connect(self, websocket: WebSocket, room_id: str, client_id: str, name: str = None, device_id: str = None):
        await websocket.accept()

        # Handle Session Override
        if device_id:
            if device_id in self.device_sessions:
                old_room_id, old_client_id, old_ws = self.device_sessions[device_id]
                try:
                    await old_ws.send_json({"type": "session_override", "message": "Session overridden."})
                    await old_ws.close(code=4001, reason="Session Overridden")
                except:
                    pass
                # Instantly remove them from their old room
                await self.disconnect(old_room_id, old_client_id)
            
            # Store new session
            self.device_sessions[device_id] = (room_id, client_id, websocket)

        room = self.get_room(room_id)
        room.active_connections[client_id] = websocket
        
        if room.host_id is None:
            room.host_id = client_id
            room.game_state.host_id = client_id
        
        # Default name if not provided
        if not name:
            name = f"Player_{client_id[:4]}"
            
        room.game_state.add_player(client_id, name)
        await self.broadcast_state(room_id)

    async def disconnect(self, room_id: str, client_id: str):
        room = self.rooms.get(room_id)
        if not room:
            return
            
        if client_id == room.host_id:
            # Host left, kick everyone and destroy room
            for cid, ws in list(room.active_connections.items()):
                if cid != client_id:
                    try:
                        await ws.send_json({"type": "host_disconnected", "message": "The host has left the operation."})
                        await ws.close(code=4000, reason="Host Left")
                    except:
                        pass
            
            if room.timer_task:
                room.timer_task.cancel()
            del self.rooms[room_id]
        else:
            # Normal player disconnect
            if client_id in room.active_connections:
                del room.active_connections[client_id]
            room.game_state.remove_player(client_id)
            
            if len(room.active_connections) == 0:
                if room.timer_task:
                    room.timer_task.cancel()
                del self.rooms[room_id]
            else:
                await self.broadcast_state(room_id)
            
        # Cleanup rate limiter
        if client_id in self.rate_limiters:
            del self.rate_limiters[client_id]

        # Cleanup device sessions (ensure we only delete if it matches the disconnecting client)
        devices_to_remove = []
        for d_id, (r_id, c_id, ws) in self.device_sessions.items():
            if c_id == client_id:
                devices_to_remove.append(d_id)
        for d_id in devices_to_remove:
            del self.device_sessions[d_id]

    def _start_timer(self, room_id: str, room: Room):
        if room.timer_task:
            room.timer_task.cancel()
            room.timer_task = None
            
        if room.game_state.settings.blitz_timer > 0 and room.game_state.phase == "playing":
            room.game_state.turn_start_time = time.time()
            room.timer_task = asyncio.create_task(self._run_timer(room_id, room, room.game_state.settings.blitz_timer))
        else:
            room.game_state.turn_start_time = None

    async def _run_timer(self, room_id: str, room: Room, duration: int):
        try:
            await asyncio.sleep(duration)
            # Timer expired
            if room.game_state.phase == "playing":
                self._switch_turn(room_id, room)
                await self.broadcast_state(room_id)
        except asyncio.CancelledError:
            pass

    async def handle_message(self, room_id: str, client_id: str, data: dict):
        if client_id not in self.rate_limiters:
            self.rate_limiters[client_id] = RateLimiter(capacity=10, refill_rate=5.0)
            
        if not self.rate_limiters[client_id].consume(1):
            print(f"Rate limit exceeded for client {client_id}")
            return

        room = self.rooms.get(room_id)
        if not room:
            return

        action = data.get("action")
        if action == "join_team":
            if room.game_state.phase != "lobby":
                return
            team = data.get("team")
            role = data.get("role")
            room.game_state.update_player_role(client_id, team, role)
            await self.broadcast_state(room_id)
            
        elif action == "update_settings":
            if room.game_state.phase == "lobby":
                settings_data = data.get("settings", {})
                for k, v in settings_data.items():
                    if hasattr(room.game_state.settings, k):
                        setattr(room.game_state.settings, k, v)
                await self.broadcast_state(room_id)
                
        elif action == "chat":
            player = room.game_state.players.get(client_id)
            if player:
                message = data.get("message")
                is_global = data.get("is_global", False) if player.role == "spymaster" else False
                
                if message:
                    message = self.profanity_filter.filter(message)
                    import datetime
                    time_str = datetime.datetime.now().strftime("%H:%M")
                    chat_payload = {
                        "type": "chat_message",
                        "message": {
                            "sender": player.name,
                            "message": message,
                            "team": player.team,
                            "time": time_str,
                            "isGlobal": is_global
                        }
                    }
                    
                    for target_client_id, connection in room.active_connections.items():
                        target_player = room.game_state.players.get(target_client_id)
                        if not target_player:
                            continue
                            
                        # Route message based on global flag or matching role
                        if is_global or player.role == target_player.role:
                            try:
                                await connection.send_json(chat_payload)
                            except Exception as e:
                                print(f"Error sending chat to {target_client_id}: {e}")

        elif action == "emote":
            emoji = data.get("emoji")
            if emoji:
                emote_payload = {
                    "type": "emote",
                    "emoji": emoji,
                    "sender": client_id
                }
                for target_client_id, connection in room.active_connections.items():
                    try:
                        await connection.send_json(emote_payload)
                    except Exception as e:
                        print(f"Error sending emote to {target_client_id}: {e}")
                                
        elif action == "start_game":
            board_size = room.game_state.settings.board_size
            custom_words = room.game_state.settings.custom_words if room.game_state.settings.word_pack != "Classic English" else None
            
            room.game_state.cards = generate_board(board_size, custom_words)
            room.game_state.phase = "playing"
            room.game_state.current_turn = "red"
            room.game_state.current_clue = None
            room.game_state.current_number = None
            room.game_state.guesses_remaining = None
            room.game_state.winner = None
            room.game_state.history = []
            
            room.game_state.red_score = 0
            room.game_state.blue_score = 0
            
            self._start_timer(room_id, room)
            await self.broadcast_state(room_id)
            
        elif action == "give_clue":
            player = room.game_state.players.get(client_id)
            if player and player.team == room.game_state.current_turn and player.role == "spymaster":
                word = data.get("word")
                number = data.get("number")
                if word and number is not None:
                    word = self.profanity_filter.filter(word)
                    # check zero_unlimited
                    num_val = 999 if str(number).lower() in ["0", "unlimited", ""] and room.game_state.settings.zero_unlimited else int(number)
                    
                    room.game_state.current_clue = word
                    room.game_state.current_number = num_val
                    room.game_state.guesses_remaining = num_val
                    
                    room.game_state.history.append({
                        "clue": word,
                        "number": num_val,
                        "team": player.team,
                        "guesses": []
                    })
                    
                    self._start_timer(room_id, room)
                    await self.broadcast_state(room_id)

        elif action == "end_turn":
            player = room.game_state.players.get(client_id)
            if player and player.team == room.game_state.current_turn and player.role == "operative":
                self._switch_turn(room_id, room)
                await self.broadcast_state(room_id)

        elif action == "ping":
            timestamp = data.get("timestamp")
            if client_id in room.active_connections:
                try:
                    await room.active_connections[client_id].send_json({"type": "pong", "timestamp": timestamp})
                except:
                    pass

        elif action == "update_ping":
            ping_val = data.get("ping", 0)
            player = room.game_state.players.get(client_id)
            if player:
                player.ping = ping_val
                await self.broadcast_state(room_id)

        elif action == "guess_card":
            player = room.game_state.players.get(client_id)
            if player and player.team == room.game_state.current_turn and player.role == "operative":
                if room.game_state.guesses_remaining is not None and room.game_state.guesses_remaining > 0:
                    index = data.get("index")
                    if index is not None and 0 <= index < len(room.game_state.cards):
                        card = room.game_state.cards[index]
                        if not card.revealed:
                            card.revealed = True
                            
                            if card.color == player.team:
                                # Correct guess
                                self._increment_score(room, card.color)
                                room.game_state.guesses_remaining -= 1
                                if room.game_state.guesses_remaining <= 0:
                                    self._switch_turn(room_id, room)
                            elif card.color == "black":
                                # Assassin
                                if room.game_state.settings.forgiving_assassin:
                                    enemy_team = "blue" if player.team == "red" else "red"
                                    self._increment_score(room, enemy_team, amount=3)
                                    if room.game_state.winner is None:
                                        self._switch_turn(room_id, room)
                                else:
                                    room.game_state.winner = "blue" if player.team == "red" else "red"
                                    room.game_state.phase = "game_over"
                            elif card.color == "neutral":
                                # Neutral
                                self._switch_turn(room_id, room)
                            else:
                                # Enemy team
                                self._increment_score(room, card.color)
                                self._switch_turn(room_id, room)
                            
                            if room.game_state.history:
                                is_correct = (card.color == player.team)
                                room.game_state.history[-1]["guesses"].append({
                                    "word": card.word,
                                    "color": card.color,
                                    "correct": is_correct
                                })
                                
                            await self.broadcast_state(room_id)

    def _switch_turn(self, room_id: str, room: Room):
        room.game_state.current_turn = "blue" if room.game_state.current_turn == "red" else "red"
        room.game_state.current_clue = None
        room.game_state.current_number = None
        room.game_state.guesses_remaining = None
        self._start_timer(room_id, room)

    def _increment_score(self, room: Room, team: str, amount: int = 1):
        if team == "red":
            room.game_state.red_score += amount
            total_red = sum(1 for c in room.game_state.cards if c.color == "red")
            if room.game_state.red_score >= total_red:
                room.game_state.red_score = total_red
                room.game_state.winner = "red"
                room.game_state.phase = "game_over"
        elif team == "blue":
            room.game_state.blue_score += amount
            total_blue = sum(1 for c in room.game_state.cards if c.color == "blue")
            if room.game_state.blue_score >= total_blue:
                room.game_state.blue_score = total_blue
                room.game_state.winner = "blue"
                room.game_state.phase = "game_over"
            
    async def broadcast_state(self, room_id: str):
        room = self.rooms.get(room_id)
        if not room:
            return
            
        base_state = room.game_state.model_dump()
        
        for client_id, connection in room.active_connections.items():
            player = room.game_state.players.get(client_id)
            role = player.role if player else "spectator"
            
            client_state = dict(base_state)
            
            if role == "operative" or role == "spectator":
                hidden_cards = []
                for card in client_state["cards"]:
                    if not card["revealed"]:
                        hidden_cards.append({"word": card["word"], "color": "neutral", "revealed": False})
                    else:
                        hidden_cards.append(card)
                client_state["cards"] = hidden_cards
                
            try:
                await connection.send_json({"type": "state_update", "state": client_state})
            except Exception as e:
                print(f"Error broadcasting to {client_id} in {room_id}: {e}")
