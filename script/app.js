// Initialize global variables for PeerJS
let peer, connection;
let username, partnerUsername;

// Function to go from Stage 1 to Stage 2
function goToStage2() {
    username = document.getElementById("username").value;
    const pin = document.getElementById("pin").value;

    if (username && pin.length >= 4 && pin.length <= 6) {
        // Proceed to Stage 2
        document.getElementById("stage1").classList.add("hidden");
        document.getElementById("stage2").classList.remove("hidden");

        // Initialize peer with username as ID
        peer = new Peer(username);
    } else {
        alert("Please enter a valid username and 4-6 digit PIN.");
    }
}

// Function to connect to partner and go to Stage 3
function connectToChat() {
    partnerUsername = document.getElementById("partnerUsername").value;
    const partnerPin = document.getElementById("partnerPin").value;

    if (partnerUsername && partnerPin.length >= 4 && partnerPin.length <= 6) {
        // Attempt to connect to partner
        connection = peer.connect(partnerUsername);

        connection.on("open", () => {
            document.getElementById("partnerStatus").innerText = `Connected with ${partnerUsername}`;
            document.getElementById("stage2").classList.add("hidden");
            document.getElementById("stage3").classList.remove("hidden");
            
            // Listen for messages from partner
            connection.on("data", (data) => {
                displayMessage(data, "partner-message");
            });
        });

        // Handle disconnection
        connection.on("close", () => {
            alert("Your partner has left the chat.");
            resetChat();
        });
    } else {
        alert("Please enter valid partner details.");
    }
}

// Function to display messages in the chatbox
function displayMessage(message, className) {
    const messageElement = document.createElement("div");
    messageElement.classList.add(className);
    messageElement.innerText = message;
    document.getElementById("chatbox").appendChild(messageElement);
    messageElement.scrollIntoView();
}

// Function to send a message to partner
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (message && connection && connection.open) {
        // Send message to partner
        connection.send(message);
        displayMessage(message, "self-message");
        messageInput.value = ""; // Clear input field
    } else {
        alert("You are not connected to a partner.");
    }
}

// Function to reset chat if a user leaves
function resetChat() {
    document.getElementById("stage3").classList.add("hidden");
    document.getElementById("stage1").classList.remove("hidden");
    document.getElementById("chatbox").innerHTML = ""; // Clear chat history
    peer.disconnect();
    peer = null;
    connection = null;
}

// Handle peer receiving connection from partner
peer.on("connection", (conn) => {
    connection = conn;
    partnerUsername = conn.peer;

    connection.on("open", () => {
        document.getElementById("partnerStatus").innerText = `Connected with ${partnerUsername}`;
        document.getElementById("stage2").classList.add("hidden");
        document.getElementById("stage3").classList.remove("hidden");

        // Listen for messages from partner
        connection.on("data", (data) => {
            displayMessage(data, "partner-message");
        });
    });

    // Handle disconnection from partner
    connection.on("close", () => {
        alert("Your partner has left the chat.");
        resetChat();
    });
});
