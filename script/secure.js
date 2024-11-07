// secure.js

// Secure Configuration Constants
const UNIQUE_CODE = "SM9"; // Unique code prefix for Peer connections
const MAX_ATTEMPTS = 5;    // Max attempts for entering correct PIN
const ATTEMPT_RESET_TIME = 60000; // Time to reset attempts (in ms, here 1 minute)
let attemptCount = 0;       // Track incorrect PIN attempts

// Simple Encryption and Decryption (for example purposes)
function encryptMessage(message) {
    return btoa(message); // Base64 encoding for simplicity
}

function decryptMessage(encryptedMessage) {
    return atob(encryptedMessage); // Base64 decoding
}

// Function to Verify Input for Security
function validateInput(input, type) {
    const usernamePattern = /^[a-zA-Z0-9]{3,15}$/; // Only alphanumeric usernames allowed
    const pinPattern = /^\d{4,6}$/;                // PIN must be 4-6 digits
    if (type === "username" && !usernamePattern.test(input)) {
        alert("Username must be alphanumeric and between 3-15 characters.");
        return false;
    }
    if (type === "pin" && !pinPattern.test(input)) {
        alert("PIN must be between 4 and 6 digits.");
        return false;
    }
    return true;
}

// Enforce Attempt Limits on PIN
function enforceAttemptLimit() {
    if (attemptCount >= MAX_ATTEMPTS) {
        alert("Too many attempts. Try again in 1 minute.");
        setTimeout(() => {
            attemptCount = 0; // Reset after cooldown period
        }, ATTEMPT_RESET_TIME);
        return false;
    }
    return true;
}

// Enhanced Connection Function
function connectToChatSecure() {
    const username = document.getElementById("username").value;
    const pin = document.getElementById("pin").value;
    const partnerUsername = document.getElementById("partnerUsername").value;
    const partnerPin = document.getElementById("partnerPin").value;

    // Validation of inputs before proceeding
    if (!validateInput(username, "username") || !validateInput(pin, "pin") ||
        !validateInput(partnerUsername, "username") || !validateInput(partnerPin, "pin")) {
        return;
    }

    if (!enforceAttemptLimit()) {
        attemptCount++;
        return;
    }

    const partnerId = UNIQUE_CODE + partnerUsername + partnerPin;
    const myId = UNIQUE_CODE + username + pin;

    peer = new Peer(myId, { debug: 2 });
    peer.on("open", (id) => {
        console.log("Securely connected with ID:", id);

        conn = peer.connect(partnerId);
        conn.on("open", () => {
            attemptCount = 0; // Reset on successful connection
            document.getElementById("partnerStatus").textContent = `Connected with ${partnerUsername}`;
            connectionEstablished = true;

            // Listen for data from partner
            conn.on("data", (encryptedData) => {
                const decryptedMessage = decryptMessage(encryptedData);
                displayMessage(decryptedMessage, "partner-message");
            });
        });

        conn.on("close", () => {
            alert("Partner disconnected. Chat ended.");
            location.reload();
        });
    });

    peer.on("error", (err) => {
        console.error("PeerJS error:", err);
        alert("An error occurred. Please try again.");
    });
}

// Modified Send Message Function with Encryption
function sendMessageSecure() {
    const message = document.getElementById("messageInput").value;
    if (message.trim() === "" || !conn || !conn.open) {
        return;
    }
    const encryptedMessage = encryptMessage(message);
    conn.send(encryptedMessage);
    displayMessage(message, "self-message");
    document.getElementById("messageInput").value = "";
}

// Disable Dev Tools Shortcuts and Right-Click
document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'a' || e.key === 'x' || e.key === 'i')) || (e.metaKey && e.key === 'i')) {
        e.preventDefault();
    }
});

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

// Restrict Inputs to Prevent Code Injection
document.getElementById("username").addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z0-9]/g, "");
});

document.getElementById("pin").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, ""); // Allow only numbers
});

document.getElementById("partnerUsername").addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z0-9]/g, "");
});

document.getElementById("partnerPin").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, ""); // Allow only numbers
});

// Reset and Clean Up on Page Reload
window.onbeforeunload = function () {
    if (conn) conn.close();
    if (peer) peer.disconnect();
};

// Event listener for Enter key to send message
document.getElementById("messageInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessageSecure();
    }
});
