// Go to Stage 2
function goToStage2() {
    document.getElementById('stage1').classList.add('hidden');
    document.getElementById('stage2').classList.remove('hidden');
}

// Connect to Chat (Stage 3)
function connectToChat() {
    const username = document.getElementById('username').value;
    const partnerUsername = document.getElementById('partnerUsername').value;

    if (username && partnerUsername) {
        initializePeer(username);  // Initialize peer with your username
        connectToPartner(partnerUsername);  // Connect to partner's username as ID
    }
}
