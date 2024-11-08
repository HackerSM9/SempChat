// app.js

let peer;
let conn;
let isWaiting = true;
let connectionEstablished = false;

function goToStage2() {
    const username = document.getElementById("username").value;
    const pin = document.getElementById("pin").value;

    // Validate username and PIN before moving to Stage 2
    if (!username || pin.length < 4 || pin.length > 6) {
        alert("Username and 4-6 Digit Pin is Required.");
        return;
    }
    
    document.getElementById("stage1").classList.add("hidden");
    document.getElementById("stage2").classList.remove("hidden");
}

function connectToChat() {
    const username = document.getElementById("username").value;
    const pin = document.getElementById("pin").value;
    const partnerUsername = document.getElementById("partnerUsername").value;
    const partnerPin = document.getElementById("partnerPin").value;

    // PIN validation
    if (!username || !pin || !partnerUsername || !partnerPin) {
        alert("Please fill in all fields.");
        return;
    }
    if (pin.length < 4 || pin.length > 6 || partnerPin.length < 4 || partnerPin.length > 6) {
        alert("PIN must be between 4 and 6 digits.");
        return;
    }

    const uniqueCode = "SM9"; // Unique Code for connections
    peer = new Peer(uniqueCode + username + pin, {
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ],
            iceTransportPolicy: 'all',
            iceCandidatePoolSize: 10
        },
        debug: 3
    }); // Prepend unique Code

    // Display waiting message
    document.getElementById("stage2").classList.add("hidden");
    document.getElementById("stage3").classList.remove("hidden");
    document.getElementById("partnerStatus").textContent = `Waiting for ${partnerUsername} to connect...`;

    peer.on("open", (id) => {
        console.log("Peer connected with ID:", id);

        const partnerId = uniqueCode + partnerUsername + partnerPin;
        conn = peer.connect(partnerId);

        conn.on("open", () => {
            isWaiting = false;
            connectionEstablished = true;
            document.getElementById("partnerStatus").textContent = `Connected with ${partnerUsername}`;

            conn.on("data", (data) => {
                displayMessage(data, "partner-message");
            });
        });

        conn.on("close", () => {
            alert(`${partnerUsername} exits the Chat. Click OK to New Chat!`);
            location.reload();
        });
    });

    peer.on("connection", (connection) => {
        if (!connectionEstablished) {
            conn = connection;
            isWaiting = false;
            connectionEstablished = true;
            document.getElementById("partnerStatus").textContent = `Connected with ${partnerUsername}`;

            conn.on("data", (data) => {
                displayMessage(data, "partner-message");
            });

            conn.on("close", () => {
                alert(`${partnerUsername} exits the Chat. Click OK to New Chat!`);
                location.reload();
            });
        }
    });

    // Add event listener for ICE state changes for debugging
    peer.on("iceConnectionStateChange", (event) => {
        console.log("ICE connection state changed:", peer.iceConnectionState);
        if (peer.iceConnectionState === "disconnected" || peer.iceConnectionState === "failed") {
            console.warn("Peer connection has failed or disconnected.");
        }
    });

    peer.on("error", (err) => {
        console.error("PeerJS error:", err);
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

function exitChat() {
    // Clear session storage
    sessionStorage.clear();
    // Clear cookies
    document.cookie.split(";").forEach(function(cookie) {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
    });
    // Reload the page
    location.reload();
}

// Reset on page reload
window.onbeforeunload = function () {
    if (conn) conn.close();
    if (peer) peer.disconnect();
};

// Event listener for Enter key to send message
document.getElementById("messageInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

// Disable right-click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Disable Ctrl+C and Ctrl+A
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'a')) {
        e.preventDefault();
    }
});

// Exits the ChatBox Session.
function reloadChat() {
    location.reload();
}

// Function to show pop-up message on info icon click
function showPopupMessage(event, message) {
  const existingPopup = document.querySelector(".popup-message");
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement("div");
  popup.className = "popup-message";
  popup.textContent = message;
  document.body.appendChild(popup);
  const rect = event.target.getBoundingClientRect();
  const isMobile = window.innerWidth <= 600;

  if (isMobile) {
    popup.style.left = `${Math.min(rect.left + window.scrollX, window.innerWidth - popup.offsetWidth - 10)}px`;
    popup.style.top = `${rect.top + window.scrollY - popup.offsetHeight - 10}px`;
  } else {
    popup.style.left = `${rect.left + window.scrollX + 20}px`;
    popup.style.top = `${rect.top + window.scrollY - 10}px`;
  }

  setTimeout(() => {
    popup.style.opacity = 1;
  }, 10);

  document.addEventListener("click", function hidePopup(e) {
    if (!popup.contains(e.target) && e.target !== event.target) {
      popup.remove();
      document.removeEventListener("click", hidePopup);
    }
  });
}

// Add event listeners for info icons
document.querySelectorAll(".info").forEach((icon, index) => {
  const messages = [
    "Note: This will be a Temporary Unique Username.",
    "Note: This will be a Temporary PIN.",
    "Enter Same Username as your Partner created.",
    "Enter Same Pin as your Partner Set."
  ];
  icon.addEventListener("click", (event) => showPopupMessage(event, messages[index]));
});

// Pin Restriction for User
document.getElementById("pin").addEventListener("input", function(e) {
    e.target.value = e.target.value.replace(/\D/g, "");
});

// Pin Restriction for Partner
document.getElementById("partnerPin").addEventListener("input", function(e) {
    e.target.value = e.target.value.replace(/\D/g, "");
});
    
