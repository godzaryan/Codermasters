from pydantic import BaseModel
from typing import List, Optional, Dict

class Player(BaseModel):
    id: str
    name: str
    team: str = "spectator" # "red", "blue", "spectator"
    role: str = "spectator" # "spymaster", "operative", "spectator"
    ping: int = 0

class Card(BaseModel):
    word: str
    color: str # "red", "blue", "neutral", "black"
    revealed: bool = False

class GameSettings(BaseModel):
    blitz_timer: int = 0
    word_pack: str = "Classic English"
    custom_words: List[str] = []
    forgiving_assassin: bool = False
    board_size: int = 25
    zero_unlimited: bool = True

class GameState(BaseModel):
    room_name: str = "CodeMasters Operation"
    host_id: Optional[str] = None
    players: Dict[str, Player] = {}
    cards: List[Card] = []
    settings: GameSettings = GameSettings()
    turn_start_time: Optional[float] = None
    current_turn: str = "red"
    phase: str = "lobby" # "lobby", "playing", "game_over"
    history: List[Dict] = []
    current_clue: Optional[str] = None
    current_number: Optional[int] = None
    guesses_remaining: Optional[int] = None
    winner: Optional[str] = None
    red_score: int = 0
    blue_score: int = 0
    
    def add_player(self, player_id: str, name: str):
        self.players[player_id] = Player(id=player_id, name=name)

    def remove_player(self, player_id: str):
        if player_id in self.players:
            del self.players[player_id]

    def update_player_role(self, player_id: str, team: str, role: str):
        if player_id in self.players:
            self.players[player_id].team = team
            self.players[player_id].role = role
