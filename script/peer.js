// Initialize Peer connection
let peer;
let connection;

// Function to initialize peer with username as the ID
function initializePeer(username) {
    peer = new Peer(username, {
        debug: 2,  // Optional for debugging purposes
    });

    peer.on('open', (id) => {
        console.log(`Peer connection established with ID: ${id}`);
    });

    // Listening for incoming connections
    peer.on('connection', (conn) => {
        connection = conn;
        setupConnectionEvents();
        document.getElementById('partnerStatus').innerText = `Connected with ${conn.peer}`;
        goToChatStage();
    });

    // Handle connection errors
    peer.on('error', (err) => {
        console.error(err);
        alert("An error occurred. Check console for details.");
    });
}

// Connect to the partner using their username as ID
function connectToPartner(partnerUsername) {
    connection = peer.connect(partnerUsername);
    setupConnectionEvents();
}

// Set up connection events (open, data, close, and error)
function setupConnectionEvents() {
    connection.on('open', () => {
        console.log('Connection opened with ' + connection.peer);
    });

    connection.on('data', (data) => {
        displayMessage(data, 'partner');  // Display partner's message
    });

    connection.on('close', () => {
        alert('The connection was closed');
    });

    connection.on('error', (err) => {
        console.error(err);
    });
}

// Send a message through the connection
function sendMessage() {
    const message = document.getElementById('messageInput').value;
    if (message.trim() !== '') {
        connection.send(message);  // Send message to partner
        displayMessage(message, 'self');  // Display own message
        document.getElementById('messageInput').value = '';
    }
}

// Display message in the chatbox
function displayMessage(message, sender) {
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.className = sender === 'self' ? 'self-message' : 'partner-message';
    messageElement.innerText = message;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;  // Auto-scroll to latest message
}

// Handle navigation to the chat stage
function goToChatStage() {
    document.getElementById('stage2').classList.add('hidden');
    document.getElementById('stage3').classList.remove('hidden');
}
