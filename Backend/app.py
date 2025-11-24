# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import os
# NEW IMPORT:
from dotenv import load_dotenv

# Load variables from the .env file into the environment
load_dotenv() 

app = Flask(__name__)
CORS(app) 

# Load API Key from environment variable (which is now loaded from .env)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 
if not GEMINI_API_KEY:
    # This error will now only happen if the .env file or the key is missing
    raise ValueError("GEMINI_API_KEY environment variable not set. Check your .env file.")

client = genai.Client(api_key=GEMINI_API_KEY)
chat_sessions = {} # Dictionary to store persistent chat sessions

def get_or_create_chat(session_id):
    """Retrieves or creates a new chat session for conversation history."""
    if session_id not in chat_sessions:
        # Start a new chat with the model
        chat_sessions[session_id] = client.chats.create(model="gemini-2.5-flash")
    return chat_sessions[session_id]

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    """Receives user message, calls Gemini API, and returns response."""
    data = request.get_json()
    user_message = data.get('message')
    # Use a simple session ID for tracking history
    session_id = data.get('session_id', 'default_session') 

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    try:
        chat = get_or_create_chat(session_id)
        
        # Send message to the AI
        response = chat.send_message(message=user_message)
        
        return jsonify({'response': response.text})

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({'error': 'Failed to get response from AI'}), 500

if __name__ == '__main__':
    print("Starting Flask server on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)