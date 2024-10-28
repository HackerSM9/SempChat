// app.js

let peer;
let conn;
let isWaiting = true;
let connectionAttempted = false; // New flag to track connection attempts

function goToStage2() {
    document.getElementById("stage1").classList.add("hidden");
    document.getElementById("stage2").classList.remove("hidden");
    console.log("Moved to Stage 2: Partner Username and PIN Entry");
}

function connectToChat() {
    const username = document.getElementById("username").value;
    const pin = document.getElementById("pin").value;
    const partnerUsername = document.getElementById("partnerUsername").value;
    const partnerPin = document.getElementById("partnerPin").value;

    if (!username || !pin || !partnerUsername || !partnerPin) {
        alert("Please fill in all fields.");
        return;
    }

    // Initialize Peer with a unique ID for this user
    peer = new Peer(username + pin, { debug: 3 });

    // Display waiting message
    document.getElementById("stage2").classList.add("hidden");
    document.getElementById("stage3").classList.remove("hidden");
    document.getElementById("partnerStatus").textContent = `Waiting for ${partnerUsername} to connect...`;

    // Handle Peer connection events
    peer.on("open", (id) => {
        console.log("Peer connected with ID:", id);

        const partnerId = partnerUsername + partnerPin;
        
        // Only attempt to connect if no previous attempt has been made
        if (!connectionAttempted) {
            connectionAttempted = true; // Mark connection attempt
            conn = peer.connect(partnerId);

            conn.on("open", () => {
                console.log("Connected to partner:", partnerId);
                isWaiting = false;
                document.getElementById("partnerStatus").textContent = `Connected with ${partnerUsername}`;
                
                // Handle incoming messages
                conn.on("data", (data) => {
                    displayMessage(data, "partner-message");
                });
            });

            conn.on("error", (err) => {
                console.error("Connection error:", err);
                if (isWaiting) { // Only display if still waiting for connection
                    alert("Failed to connect. Please try again.");
                }
            });
        }
    });

    // Handling incoming connection from partner
    peer.on("connection", (connection) => {
        if (!connectionAttempted) {  // Accept connection if no connection attempt made
            conn = connection;
            connectionAttempted = true;
            console.log("Partner connected to you.");
            isWaiting = false;
            document.getElementById("partnerStatus").textContent = `Connected with ${partnerUsername}`;
            
            // Handle incoming messages
            conn.on("data", (data) => {
                displayMessage(data, "partner-message");
            });
        }
    });

    peer.on("error", (err) => {
        console.error("PeerJS error:", err);
        if (isWaiting) { // Avoid showing error after connection established
            alert("Failed to connect. Please check your connection and try again.");
        }
    });
}

function sendMessage() {
    const message = document.getElementById("messageInput").value;
    if (message.trim() === "" || !conn || !conn.open) {
        return;
    }
    displayMessage(message, "self-message");
    conn.send(message);
    document.getElementById("messageInput").value = "";
}

function displayMessage(message, className) {
    const messageElement = document.createElement("div");
    messageElement.classList.add(className);
    messageElement.textContent = message;
    document.getElementById("chatbox").appendChild(messageElement);
    messageElement.scrollIntoView();
}

window.onbeforeunload = function () {
    if (conn) conn.close();
    if (peer) peer.disconnect();
};
