import random
from models.state import Card

# Mock dictionary for now. In production, this loads from a JSON/DB.
WORDS = [
    "APPLE", "OCEAN", "MOUNTAIN", "EAGLE", "SPY", "KNIGHT", "GHOST", "FIRE", "ICE", "ROSE",
    "SWORD", "SHIELD", "CASTLE", "DRAGON", "WIZARD", "MOON", "STAR", "SUN", "PLANET", "COMET",
    "RIVER", "FOREST", "DESERT", "JUNGLE", "ISLAND", "SHIP", "TRAIN", "PLANE", "CAR", "BIKE",
    "GOLD", "SILVER", "BRONZE", "IRON", "STEEL", "WOOD", "STONE", "BRICK", "GLASS", "PLASTIC"
]

def generate_board(size: int = 25, custom_words: list = None) -> list[Card]:
    word_pool = custom_words if custom_words and len(custom_words) >= size else WORDS
    
    # If the word pool is smaller than the size somehow, we pad it with default words or just sample with replacement (or just sample available)
    if len(word_pool) < size:
        word_pool = (word_pool * (size // len(word_pool) + 1))[:size]
        
    selected_words = random.sample(word_pool, size)
    
    if size == 36:
        # 12 Red, 11 Blue, 11 Neutral, 2 Black
        colors = ["red"] * 12 + ["blue"] * 11 + ["neutral"] * 11 + ["black"] * 2
    else:
        # 9 Red, 8 Blue, 7 Neutral, 1 Black (Assassin)
        # Assuming Red goes first
        colors = ["red"] * 9 + ["blue"] * 8 + ["neutral"] * 7 + ["black"] * 1
        
    random.shuffle(colors)
    
    board = []
    for i in range(size):
        board.append(Card(word=selected_words[i], color=colors[i], revealed=False))
        
    return board
