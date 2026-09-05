from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.connection_manager import ConnectionManager
from core.security import ProfanityFilter
import uvicorn
import random
import string

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()
profanity_filter = ProfanityFilter()

class RoomCreate(BaseModel):
    name: str = "CodeMasters Operation"

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/rooms/public")
async def create_public_room(room_data: RoomCreate):
    room_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    room = manager.get_room(room_id)
    room.is_public = True
    room.game_state.room_name = profanity_filter.filter(room_data.name)
    return {"room_id": room_id}

@app.post("/api/rooms/private")
async def create_private_room(room_data: RoomCreate):
    room_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    room = manager.get_room(room_id)
    room.is_public = False
    room.game_state.room_name = profanity_filter.filter(room_data.name)
    return {"room_id": room_id}

@app.get("/api/rooms/public")
async def list_public_rooms():
    rooms_list = []
    for room_id, room in manager.rooms.items():
        if room.is_public and room.game_state.phase == "lobby":
            if len(room.game_state.players) < 6:
                rooms_list.append({
                    "room_id": room_id,
                    "name": room.game_state.room_name,
                    "player_count": len(room.game_state.players),
                    "created_at": getattr(room, "created_at", 0)
                })
    
    # Sort by newest first and limit to 20
    rooms_list.sort(key=lambda x: x["created_at"], reverse=True)
    return {"rooms": rooms_list[:20]}

@app.get("/api/rooms/public/join")
async def find_public_room():
    for room_id, room in manager.rooms.items():
        if room.is_public and room.game_state.phase == "lobby":
            if len(room.game_state.players) < 6:
                return {"room_id": room_id}
    raise HTTPException(status_code=404, detail="No available public rooms")

@app.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str, name: str = None, deviceId: str = None):
    await manager.connect(websocket, room_id, client_id, name, deviceId)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.handle_message(room_id, client_id, data)
    except WebSocketDisconnect:
        await manager.disconnect(room_id, client_id)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=6969, reload=True)
