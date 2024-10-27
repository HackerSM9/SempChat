// Simulate entering partner info
function enterPartnerInfo() {
    document.getElementById("login-stage").style.display = "none";
    document.getElementById("partner-stage").style.display = "block";
}

// Simulate connecting to chat
function connectToChat() {
    const partnerName = document.getElementById("partner-username").value;
    document.getElementById("partner-name").textContent = partnerName;
    document.getElementById("partner-stage").style.display = "none";
    document.getElementById("chat-stage").style.display = "block";
}

// Function to send a message
function sendMessage() {
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;
    if (message.trim() === "") return;

    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    messageElement.className = "user-message";
    chatBox.appendChild(messageElement);

    messageInput.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
}
