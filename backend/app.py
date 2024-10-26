# backend/app.py

from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app)

if __name__ == '__main__':
    socketio.run(app, debug=True)