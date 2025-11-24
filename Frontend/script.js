// script.js

// URL where the Flask server is running
const BACKEND_URL = 'http://127.0.0.1:5000/chat'; 
// Use a fixed session ID for a single user (for conversation history)
const CHAT_SESSION_ID = 'chat_session_user_001'; 

const chatWindow = document.getElementById('chat-window');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-btn');

// --- Helper Functions ---

function addMessageToChat(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    messageDiv.appendChild(paragraph);
    
    chatWindow.appendChild(messageDiv);
    
    // Auto-scroll to the latest message
    chatWindow.scrollTop = chatWindow.scrollHeight;
    
    return messageDiv; // Return the element to allow updates (for 'Thinking...')
}

// --- Main Send Logic ---

async function sendMessage() {
    const userText = messageInput.value.trim();
    if (!userText) return;

    // 1. Clear input and add user message to UI
    addMessageToChat('outgoing', userText); 
    messageInput.value = '';
    messageInput.disabled = true;
    sendButton.disabled = true;

    // 2. Add a "Thinking..." message placeholder
    const botLoadingMessage = addMessageToChat('incoming', 'Thinking...');

    try {
        // 3. Call the Python backend using fetch
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userText,
                session_id: CHAT_SESSION_ID
            })
        });

        const data = await response.json();
        
        // 4. Update the bot's message with the final response
        let botResponseText;
        if (response.ok && data.response) {
            botResponseText = data.response;
        } else {
            botResponseText = `Error: ${data.error || 'Failed to connect to the server.'}`;
        }
        
        botLoadingMessage.querySelector('p').textContent = botResponseText;

    } catch (error) {
        console.error("Fetch or API Error:", error);
        botLoadingMessage.querySelector('p').textContent = "Sorry, the connection failed. Check the server.";
    } finally {
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus(); // Focus back on input
    }
}

// --- Event Listeners ---

// Send message on button click
sendButton.addEventListener('click', sendMessage);

// Send message on Enter key (Shift+Enter for a new line)
messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevents adding a new line
        sendMessage();
    }
});