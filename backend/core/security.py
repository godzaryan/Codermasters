import time

class RateLimiter:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refill = time.time()

    def consume(self, tokens: int = 1) -> bool:
        now = time.time()
        time_passed = now - self.last_refill
        
        # Refill tokens
        self.tokens += time_passed * self.refill_rate
        if self.tokens > self.capacity:
            self.tokens = self.capacity
            
        self.last_refill = now

        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        
        return False

class ProfanityFilter:
    def __init__(self):
        # A basic list for demonstration purposes
        self.bad_words = {
            "shit", "fuck", "bitch", "asshole", "cunt", "dick", "pussy", "bastard", "slut", "whore"
        }

    def filter(self, text: str) -> str:
        if not text:
            return text
            
        words = text.split()
        for i, word in enumerate(words):
            # Very basic string check (ignoring punctuation for simplicity in this demo)
            lower_word = word.lower()
            if any(bad_word in lower_word for bad_word in self.bad_words):
                words[i] = "***"
                
        return " ".join(words)
