// Go to Stage 2
function goToStage2() {
    document.getElementById('stage1').classList.add('hidden');
    document.getElementById('stage2').classList.remove('hidden');
}

// Connect to Chat (Stage 3)
function connectToChat() {
    const username = document.getElementById('username').value;
    const pin = document.getElementById('pin').value;
    const partnerUsername = document.getElementById('partnerUsername').value;
    const partnerPin = document.getElementById('partnerPin').value;

    // Placeholder for connection logic
    if (username && pin && partnerUsername && partnerPin) {
        document.getElementById('partnerStatus').innerText = `Connected with ${partnerUsername}`;
        document.getElementById('stage2').classList.add('hidden');
        document.getElementById('stage3').classList.remove('hidden');
    }
}

// Placeholder: Send Message
function sendMessage() {
    const message = document.getElementById('messageInput').value;
    if (message.trim() !== '') {
        const chatbox = document.getElementById('chatbox');
        const messageElement = document.createElement('div');
        messageElement.innerText = message;
        chatbox.appendChild(messageElement);
        document.getElementById('messageInput').value = '';

        // Automatically scroll to the latest message
        chatbox.scrollTop = chatbox.scrollHeight;
    }
}
