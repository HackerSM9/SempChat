// app.js

let peer;
let conn;
let partnerUsername = "";
let partnerConnected = false;

function goToStage2() {
    document.getElementById("stage1").classList.add("hidden");
    document.getElementById("stage2").classList.remove("hidden");
}

function connectToChat() {
    const username = document.getElementById("username").value;
    const pin = document.getElementById("pin").value;
    partnerUsername = document.getElementById("partnerUsername").value;
    const partnerPin = document.getElementById("partnerPin").value;

    if (!username || !pin || !partnerUsername || !partnerPin) {
        alert("Please fill in all fields.");
        return;
    }

    peer = new Peer(username + pin, { debug: 2 });
    peer.on("open", () => {
        const partnerId = partnerUsername + partnerPin;
        conn = peer.connect(partnerId);

        // Initiate connection when both peers match
        conn.on("open", () => {
            partnerConnected = true;
            document.getElementById("stage2").classList.add("hidden");
            document.getElementById("stage3").classList.remove("hidden");
            document.getElementById("partnerStatus").textContent = `Connected with ${partnerUsername}`;
            
            // Listen for messages
            conn.on("data", (data) => {
                displayMessage(data, "partner-message");
            });

            // Handle disconnects for clean data reset
            conn.on("close", () => handleDisconnect());
        });

        conn.on("error", () => {
            if (!partnerConnected) alert("Failed to connect. Please check credentials and try again.");
        });
    });

    peer.on("connection", (connection) => {
        conn = connection;
        partnerConnected = true;
        document.getElementById("stage2").classList.add("hidden");
        document.getElementById("stage3").classList.remove("hidden");
        document.getElementById("partnerStatus").textContent = `Connected with ${partnerUsername}`;

        conn.on("data", (data) => displayMessage(data, "partner-message"));
        conn.on("close", () => handleDisconnect());
    });
}

function sendMessage() {
    const message = document.getElementById("messageInput").value;
    if (message.trim() === "" || !conn || !conn.open) return;
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

// Function to handle disconnects by clearing credentials and messages
function handleDisconnect() {
    alert("Partner has disconnected. Exiting chat session.");
    resetApp();
}

// Function to clear chat data and reset stages
function resetApp() {
    partnerConnected = false;
    if (conn) conn.close();
    if (peer) peer.disconnect();
    document.getElementById("chatbox").innerHTML = "";
    document.getElementById("username").value = "";
    document.getElementById("pin").value = "";
    document.getElementById("partnerUsername").value = "";
    document.getElementById("partnerPin").value = "";
    document.getElementById("stage3").classList.add("hidden");
    document.getElementById("stage1").classList.remove("hidden");
}

window.onbeforeunload = () => resetApp();
