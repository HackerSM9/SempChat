// app.js

let peer;
let conn;
let isConnected = false;

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

    // Show waiting message while connecting
    document.getElementById("stage2").classList.add("hidden");
    document.getElementById("stage3").classList.remove("hidden");
    document.getElementById("partnerStatus").textContent = `Waiting for ${partnerUsername} to connect...`;

    const partnerId = partnerUsername + partnerPin;

    // Only one user should initiate connection to avoid conflicts
    setTimeout(() => {
        if (!isConnected) {
            initiateConnection(partnerId);
        }
    }, 1000);

    // Listen for incoming connection from partner
    peer.on("connection", (connection) => {
        if (!isConnected) {
            setupConnection(connection, partnerUsername);
        }
    });

    peer.on("error", (err) => {
        console.error("PeerJS error:", err);
        if (!isConnected) {
            alert("Connection failed. Please check your credentials and try again.");
            resetApp();
        }
    });
}

function initiateConnection(partnerId) {
    conn = peer.connect(partnerId);

    conn.on("open", () => {
        console.log("Connection opened with partner:", partnerId);
        isConnected = true;
        document.getElementById("partnerStatus").textContent = `Connected with partner`;
        
        // Handle incoming messages
        conn.on("data", (data) => {
            displayMessage(data, "partner-message");
        });
    });

    conn.on("error", (err) => {
        console.error("Connection error:", err);
        if (!isConnected) {
            alert("Failed to connect. Please try again.");
        }
    });
}

function setupConnection(connection, partnerUsername) {
    conn = connection;
    isConnected = true;
    document.getElementById("partnerStatus").textContent = `Connected with ${partnerUsername}`;

    conn.on("data", (data) => {
        displayMessage(data, "partner-message");
    });

    conn.on("close", () => {
        alert("Partner has disconnected.");
        resetApp();
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

function resetApp() {
    document.getElementById("stage1").classList.remove("hidden");
    document.getElementById("stage2").classList.add("hidden");
    document.getElementById("stage3").classList.add("hidden");
    document.getElementById("username").value = "";
    document.getElementById("pin").value = "";
    document.getElementById("partnerUsername").value = "";
    document.getElementById("partnerPin").value = "";
    isConnected = false;
    if (conn) conn.close();
    if (peer) peer.disconnect();
}

window.onbeforeunload = function () {
    if (conn) conn.close();
    if (peer) peer.disconnect();
};
