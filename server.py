import asyncio
import http
import mimetypes
import urllib.parse
import websockets
import json
import uuid
import random

# --- Combined HTTP & WebSocket Server ---
PORT = 8003

rooms = {} # roomCode: {mode: 'coop|pvp', players: [websocket], gameState: {...}}
player_rooms = {} # websocket: roomCode

def generate_room_code():
    return str(random.randint(1000, 9999))

async def handle_client(websocket, path):
    print("New WS client connected")
    try:
        async for message in websocket:
            data = json.loads(message)
            action = data.get('action')
            
            if action == 'CREATE_ROOM':
                mode = data.get('mode', 'pvp')
                code = generate_room_code()
                while code in rooms:
                    code = generate_room_code()
                
                rooms[code] = {
                    'mode': mode,
                    'players': [websocket],
                    'ready': {websocket: False},
                    'scores': {websocket: 0},
                    'state': None # Used for CO-OP
                }
                player_rooms[websocket] = code
                await websocket.send(json.dumps({'type': 'ROOM_CREATED', 'code': code, 'mode': mode}))
            
            elif action == 'JOIN_ROOM':
                code = data.get('code')
                if code in rooms:
                    room = rooms[code]
                    if len(room['players']) < 2: # Limit 2 for now
                        room['players'].append(websocket)
                        room['ready'][websocket] = False
                        room['scores'][websocket] = 0
                        player_rooms[websocket] = code
                        await websocket.send(json.dumps({'type': 'ROOM_JOINED', 'code': code, 'mode': room['mode']}))
                        
                        # Notify everyone
                        for p in room['players']:
                            await p.send(json.dumps({'type': 'PLAYER_JOINED', 'count': len(room['players'])}))
                    else:
                        await websocket.send(json.dumps({'type': 'ERROR', 'msg': 'Room full'}))
                else:
                    await websocket.send(json.dumps({'type': 'ERROR', 'msg': 'Room not found'}))
                    
            elif action == 'TOGGLE_READY':
                code = player_rooms.get(websocket)
                if code in rooms:
                    room = rooms[code]
                    room['ready'][websocket] = not room['ready'][websocket]
                    
                    # Notify statuses
                    ready_count = sum(1 for v in room['ready'].values() if v)
                    for p in room['players']:
                        await p.send(json.dumps({'type': 'READY_STATUS', 'readyCount': ready_count, 'total': len(room['players'])}))
                        
                    # If all ready and at least 2 people (or 1 if testing pvp alone)
                    if ready_count == len(room['players']) and len(room['players']) > 0:
                        # Assign roles if COOP
                        if room['mode'] == 'coop':
                            for i, p in enumerate(room['players']):
                                role = 'host' if i == 0 else 'joiner'
                                await p.send(json.dumps({'type': 'GAME_START', 'role': role}))
                        else:
                            for p in room['players']:
                                await p.send(json.dumps({'type': 'GAME_START'}))
                                
            # --- PVP ---
            elif action == 'SCORE_UPDATE':
                code = player_rooms.get(websocket)
                if code in rooms and rooms[code]['mode'] == 'pvp':
                    rooms[code]['scores'][websocket] = data.get('score', 0)
                    # Broadcast to others
                    for p in rooms[code]['players']:
                        if p != websocket:
                            await p.send(json.dumps({
                                'type': 'OPPONENT_SCORE', 
                                'score': data.get('score', 0)
                            }))
                            
            # --- CO-OP Sync ---
            elif action == 'SYNC_STATE':
                code = player_rooms.get(websocket)
                if code in rooms and rooms[code]['mode'] == 'coop':
                    # The host simply overwrites the state, and we broadcast it to joiner.
                    # Or specific events are sent. For simplicity, broadcast the event to the other player.
                    for p in rooms[code]['players']:
                        if p != websocket:
                            await p.send(json.dumps({
                                'type': 'SYNC_EVENT',
                                'eventData': data.get('eventData')
                            }))

    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        # Disconnect handling
        code = player_rooms.get(websocket)
        if code in rooms:
            room = rooms[code]
            if websocket in room['players']:
                room['players'].remove(websocket)
                
            if len(room['players']) == 0:
                del rooms[code]
            else:
                for p in room['players']:
                    await p.send(json.dumps({'type': 'PLAYER_LEFT', 'count': len(room['players'])}))
        
        if websocket in player_rooms:
            del player_rooms[websocket]
        print("WS client disconnected")

async def process_request(path, request_headers):
    # If this is a websocket upgrade request, return None to proceed with ws handshake
    if "websocket" in request_headers.get("Upgrade", "").lower():
        return None
        
    # Otherwise, act as a static HTTP server
    path = urllib.parse.unquote(path.split("?")[0])
    if path == "/":
        path = "/index.html"
        
    filepath = "." + path
    try:
        with open(filepath, "rb") as f:
            body = f.read()
            mime_type, _ = mimetypes.guess_type(filepath)
            headers = [
                ("Content-Type", mime_type or "application/octet-stream"),
                ("Content-Length", str(len(body))),
            ]
            return (http.HTTPStatus.OK, headers, body)
    except FileNotFoundError:
        return (http.HTTPStatus.NOT_FOUND, [], b"404 Not Found")

async def start_ws_server():
    print(f"Starting unified HTTP/WebSocket server on port {PORT}")
    import websockets.legacy.server
    async with websockets.legacy.server.serve(handle_client, "", PORT, process_request=process_request):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(start_ws_server())
