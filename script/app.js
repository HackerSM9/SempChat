// app.js

let peer;
let conn;

// Move to Stage 2 after entering username and PIN
function goToStage2() {
    document.getElementById("stage1").classList.add("hidden");
    document.getElementById("stage2").classList.remove("hidden");
}

// Connect to partner's username and PIN
function connectToChat() {
    const username = document.getElementById("username").value;
    const pin = document.getElementById("pin").value;
    const partnerUsername = document.getElementById("partnerUsername").value;
    const partnerPin = document.getElementById("partnerPin").value;

    // Initialize Peer
    peer = new Peer(username + pin);

    // Wait for Peer to be ready
    peer.on("open", () => {
        document.getElementById("partnerStatus").textContent = `Waiting for ${partnerUsername} to connect...`;
    });

    // Connect to partner using their ID
    const partnerId = partnerUsername + partnerPin;
    conn = peer.connect(partnerId);

    conn.on("open", () => {
        // Move to Stage 3 (Chatbox) once connected
        document.getElementById("stage2").classList.add("hidden");
        document.getElementById("stage3").classList.remove("hidden");
        document.getElementById("partnerStatus").textContent = `Connected with ${partnerUsername}`;
        
        // Set up receiving messages
        conn.on("data", (data) => {
            displayMessage(data, "partner-message");
        });
    });

    // Handle incoming connections
    peer.on("connection", (connection) => {
        conn = connection;
        conn.on("data", (data) => {
            displayMessage(data, "partner-message");
        });
    });
}

// Send a message to the partner
function sendMessage() {
    const message = document.getElementById("messageInput").value;
    if (message.trim() === "" || !conn || !conn.open) {
        return;
    }
    displayMessage(message, "self-message"); // Display the message on the sender's side
    conn.send(message); // Send the message through PeerJS
    document.getElementById("messageInput").value = ""; // Clear input field
}

// Display message in chatbox
function displayMessage(message, className) {
    const messageElement = document.createElement("div");
    messageElement.classList.add(className);
    messageElement.textContent = message;
    document.getElementById("chatbox").appendChild(messageElement);
    messageElement.scrollIntoView();
}

// Close connection if one user leaves
window.onbeforeunload = function () {
    if (conn) {
        conn.close();
    }
    if (peer) {
        peer.disconnect();
    }
};
