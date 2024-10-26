# backend/socket.py

from app import socketio

# Dictionary to keep track of connected users
connected_users = {}

@socketio.on('connect')
def handle_connect():
    print("User connected")

@socketio.on('disconnect')
def handle_disconnect():
    print("User disconnected")

@socketio.on('send_message')
def handle_send_message(data):
    username = data.get('username')
    message = data.get('message')
    # Broadcast message to the connected partner
    socketio.emit('receive_message', {'username': username, 'message': message}, broadcast=True)