import asyncio
import http
import mimetypes
import urllib.parse
import websockets
import json
import uuid
import random
import os

# --- Combined HTTP & WebSocket Server ---
PORT = 8003
LB_FILE = 'leaderboard.json'
USERS_FILE = 'users.json'

rooms = {} # roomCode: {mode: 'coop|pvp', players: [websocket], gameState: {...}}
player_rooms = {} # websocket: roomCode
logged_in_users = {} # websocket: username

# User & Leaderboard helpers
def load_json(filepath):
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            try: return json.load(f)
            except: return []
    return []

def save_json(filepath, data):
    with open(filepath, 'w') as f:
        json.dump(data, f)

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
            
            # --- AUTH & SAVE ---
            elif action == 'REGISTER':
                username = data.get('username')
                password = data.get('password')
                users = load_json(USERS_FILE)
                if any(u['username'] == username for u in users):
                    await websocket.send(json.dumps({'type': 'ERROR', 'msg': 'User exists'}))
                else:
                    users.append({'username': username, 'password': password, 'progress': None})
                    save_json(USERS_FILE, users)
                    await websocket.send(json.dumps({'type': 'REGISTER_SUCCESS'}))

            elif action == 'LOGIN':
                username = data.get('username')
                password = data.get('password')
                users = load_json(USERS_FILE)
                user = next((u for u in users if u['username'] == username and u['password'] == password), None)
                if user:
                    logged_in_users[websocket] = username
                    await websocket.send(json.dumps({
                        'type': 'LOGIN_SUCCESS', 
                        'username': username,
                        'progress': user.get('progress')
                    }))
                else:
                    await websocket.send(json.dumps({'type': 'ERROR', 'msg': 'Invalid login'}))

            elif action == 'SAVE_PROGRESS':
                username = logged_in_users.get(websocket)
                if username:
                    progress = data.get('progress')
                    users = load_json(USERS_FILE)
                    for u in users:
                        if u['username'] == username:
                            u['progress'] = progress
                            break
                    save_json(USERS_FILE, users)
                    await websocket.send(json.dumps({'type': 'SAVE_SUCCESS'}))
                else:
                    await websocket.send(json.dumps({'type': 'ERROR', 'msg': 'Not logged in'}))

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
    # WebSocket upgrade
    if "websocket" in request_headers.get("Upgrade", "").lower():
        return None
    
    raw_path = urllib.parse.unquote(path.split("?")[0])
    
    # --- API: GET leaderboard ---
    if raw_path == "/api/leaderboard":
        lb = load_json(LB_FILE)
        body = json.dumps(lb).encode()
        headers = [
            ("Content-Type", "application/json"),
            ("Content-Length", str(len(body))),
            ("Access-Control-Allow-Origin", "*"),
        ]
        return (http.HTTPStatus.OK, headers, body)
    
    # --- API: POST submit score ---
    if raw_path == "/api/submit_score":
        # Read the body from the request
        content_length = int(request_headers.get("Content-Length", 0))
        # For POST with websockets process_request, we can't easily read body
        # So we use query params instead: /api/submit_score?name=X&score=Y
        query = urllib.parse.urlparse(path).query
        params = urllib.parse.parse_qs(query)
        name = params.get('name', ['Unknown'])[0]
        score = int(params.get('score', [0])[0])
        
        lb = load_json(LB_FILE)
        # Update existing or add new
        found = False
        for entry in lb:
            if entry['name'] == name:
                if score > entry['score']:
                    entry['score'] = score
                found = True
                break
        if not found:
            lb.append({'name': name, 'score': score})
        
        # Sort descending
        lb.sort(key=lambda x: x['score'], reverse=True)
        # Keep top 50
        lb = lb[:50]
        save_json(LB_FILE, lb)
        
        body = json.dumps({'ok': True}).encode()
        headers = [
            ("Content-Type", "application/json"),
            ("Content-Length", str(len(body))),
            ("Access-Control-Allow-Origin", "*"),
        ]
        return (http.HTTPStatus.OK, headers, body)

    # Otherwise, static HTTP server
    if raw_path == "/":
        raw_path = "/index.html"
        
    filepath = "." + raw_path
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
