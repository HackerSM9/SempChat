// app.js

let peer;
let conn;
let isWaiting = true;
let connectionEstablished = false;
const uniqueCode = "SM9"; // Unique Code for connections
let retryAttempts = 0; // Counter for reconnection attempts

// Step 1: Set up a TURN server and configure peer connection
peer = new Peer({
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }, // Public STUN server
            { urls: 'turn:your.turn.server', username: 'user', credential: 'pass' } // Custom TURN server details
        ]
    },
    debug: 3
});

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

    if (!username || !pin || !partnerUsername || !partnerPin) {
        alert("Please fill in all fields.");
        return;
    }
    if (pin.length < 4 || pin.length > 6 || partnerPin.length < 4 || partnerPin.length > 6) {
        alert("PIN must be between 4 and 6 digits.");
        return;
    }

    // Create peer ID with unique code and user credentials
    const peerId = uniqueCode + username + pin;
    peer = new Peer(peerId, { debug: 3 });
    
    // Event listener for connection status
    peer.on("open", (id) => {
        console.log("Peer connected with ID:", id);
        attemptConnectionToPartner();
    });

    // Step 2: Handle incoming connection requests
    peer.on("connection", (connection) => {
        if (!connectionEstablished) {
            setupConnection(connection, partnerUsername);
        }
    });

    // Step 3: Error handling and reconnection attempts
    peer.on("error", (err) => {
        console.error("PeerJS error:", err);
        if (retryAttempts < 3) { // Retry up to 3 times
            retryAttempts++;
            setTimeout(attemptConnectionToPartner, 2000); // Retry after 2 seconds
        } else {
            alert("Failed to establish connection. Please try again.");
        }
    });
}

// Attempt to connect to the partner's peer ID
function attemptConnectionToPartner() {
    const partnerUsername = document.getElementById("partnerUsername").value;
    const partnerPin = document.getElementById("partnerPin").value;
    const partnerId = uniqueCode + partnerUsername + partnerPin;
    conn = peer.connect(partnerId);

    conn.on("open", () => {
        setupConnection(conn, partnerUsername);
    });

    conn.on("close", () => {
        handleDisconnection(partnerUsername);
    });
}

// Step 4: Set up the connection with data handling and events
function setupConnection(connection, partnerUsername) {
    isWaiting = false;
    connectionEstablished = true;
    conn = connection;
    document.getElementById("partnerStatus").textContent = `Connected with ${partnerUsername}`;

    // Listen for incoming messages
    conn.on("data", (data) => {
        displayMessage(data, "partner-message");
    });

    // Close the connection when partner disconnects
    conn.on("close", () => {
        handleDisconnection(partnerUsername);
    });
}

// Step 5: Manage disconnection events
function handleDisconnection(partnerUsername) {
    alert(`${partnerUsername} has left the chat. Click OK to start a new chat!`);
    location.reload();
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

// Step 6: Automatic reconnection on page reload
window.onbeforeunload = function () {
    if (conn) conn.close();
    if (peer) peer.disconnect();
};

// Step 7: Event listener for Enter key to send message
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
  // Remove any existing pop-up message to avoid multiple pop-ups
  const existingPopup = document.querySelector(".popup-message");
  if (existingPopup) existingPopup.remove();

  // Create a new pop-up div
  const popup = document.createElement("div");
  popup.className = "popup-message";
  popup.textContent = message;

  // Append the popup to the body to position it later
  document.body.appendChild(popup);
  const rect = event.target.getBoundingClientRect();

  // Check the viewport width and position accordingly
  const isMobile = window.innerWidth <= 600;
  if (isMobile) {
    // Position the pop-up above the icon for mobile
    popup.style.left = `${Math.min(rect.left + window.scrollX, window.innerWidth - popup.offsetWidth - 10)}px`;
    popup.style.top = `${rect.top + window.scrollY - popup.offsetHeight - 10}px`;
  } else {
    // Position near the icon for desktop
    popup.style.left = `${rect.left + window.scrollX + 20}px`;
    popup.style.top = `${rect.top + window.scrollY - 10}px`;
  }

  // Show the pop-up
  setTimeout(() => {
    popup.style.opacity = 1;
  }, 10);

  // Close the pop-up when clicking outside of it
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
    "Create a unique username for security purposes.",
    "Create a unique PIN (4-6 digits) for secure access.",
    "Enter Same Username as your Partner created",
    "Enter Same Pin as your Partner created"
  ];
  icon.addEventListener("click", (event) => showPopupMessage(event, messages[index]));
});


// Pin Restriction for User
document.getElementById("pin").addEventListener("input", function(e) {
    // Replace any non-numeric characters with an empty string
    e.target.value = e.target.value.replace(/\D/g, "");
});

// Pin Restriction for Partner
document.getElementById("partnerPin").addEventListener("input", function(e) {
    // Replace any non-numeric characters with an empty string
    e.target.value = e.target.value.replace(/\D/g, "");
});
