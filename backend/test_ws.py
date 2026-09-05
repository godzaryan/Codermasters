import asyncio
import websockets
import json

async def test_game():
    uri1 = "ws://localhost:6969/ws/test-room/client-1"
    uri2 = "ws://localhost:6969/ws/test-room/client-2"
    uri3 = "ws://localhost:6969/ws/test-room/client-3"
    
    async with websockets.connect(uri1) as ws1, \
               websockets.connect(uri2) as ws2, \
               websockets.connect(uri3) as ws3:
        
        # Drain initial connections
        await ws1.recv()
        await ws2.recv()
        await ws3.recv()

        # Join roles
        await ws1.send(json.dumps({"action": "join_team", "team": "red", "role": "spymaster"}))
        await ws2.send(json.dumps({"action": "join_team", "team": "blue", "role": "spymaster"}))
        await ws3.send(json.dumps({"action": "join_team", "team": "red", "role": "operative"}))
        
        # Drain state updates from joins (each client gets 3 updates)
        for _ in range(3):
            await ws1.recv()
            await ws2.recv()
            await ws3.recv()
            
        print("All clients joined and synced.")

        # Test 1: Spymaster Private Chat
        await ws1.send(json.dumps({"action": "chat", "message": "Spymasters only!"}))
        
        # ws1 and ws2 should receive it. ws3 should not.
        msg1 = json.loads(await ws1.recv())
        msg2 = json.loads(await ws2.recv())
        
        assert msg1["type"] == "chat_message"
        assert msg2["type"] == "chat_message"
        assert msg1["message"]["message"] == "Spymasters only!"
        assert not msg1["message"]["isGlobal"]
        
        # Ensure ws3 did not receive it (wait a tiny bit and check queue)
        try:
            await asyncio.wait_for(ws3.recv(), timeout=0.5)
            assert False, "Operative should not receive Spymaster private chat"
        except asyncio.TimeoutError:
            pass
        
        print("Test 1 Passed: Spymaster Private Chat")

        # Test 2: Operative Private Chat
        await ws3.send(json.dumps({"action": "chat", "message": "Operatives only!"}))
        
        # ws3 should receive it. ws1 and ws2 should not.
        msg3 = json.loads(await ws3.recv())
        assert msg3["type"] == "chat_message"
        assert msg3["message"]["message"] == "Operatives only!"
        
        try:
            await asyncio.wait_for(ws1.recv(), timeout=0.5)
            assert False, "Spymaster should not receive Operative private chat"
        except asyncio.TimeoutError:
            pass
            
        print("Test 2 Passed: Operative Private Chat")

        # Test 3: Global Quick Chat
        await ws1.send(json.dumps({"action": "chat", "message": "GLOBAL CHAT!", "is_global": True}))
        
        # All three should receive it
        msg1 = json.loads(await ws1.recv())
        msg2 = json.loads(await ws2.recv())
        msg3 = json.loads(await ws3.recv())
        
        assert msg1["type"] == "chat_message"
        assert msg2["type"] == "chat_message"
        assert msg3["type"] == "chat_message"
        assert msg1["message"]["isGlobal"]
        assert msg3["message"]["isGlobal"]
        
        print("Test 3 Passed: Global Quick Chat")

        # Test 4: Ephemeral Chat for Late Joiner
        uri4 = "ws://localhost:6969/ws/test-room/client-4"
        async with websockets.connect(uri4) as ws4:
            state_update = json.loads(await ws4.recv())
            assert state_update["type"] == "state_update"
            assert "chat_history" not in state_update["state"]
            
            # They should not receive any chat messages immediately upon join
            try:
                await asyncio.wait_for(ws4.recv(), timeout=0.5)
                assert False, "Late joiner should not receive past chat messages"
            except asyncio.TimeoutError:
                pass
                
        print("Test 4 Passed: Ephemeral Chat")
        
        print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_game())
