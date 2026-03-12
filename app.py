import os
from flask import Flask, request, render_template
from google.cloud import firestore
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Initialize Firestore DB
db = firestore.Client()
notes_collection = db.collection('notes')

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/notes', methods=['POST'])
def add_note():
    """Create a new note from user input."""
    data = request.get_json()
    if not data:
        return {"error": "Request must contain JSON data"}, 400

    title = data.get('title')
    content = data.get('content')

    if not title or not content:
        return {"error": "Title and content are required"}, 400

    try:
        doc_ref = notes_collection.add({'title': title, 'content': content})
        return {"message": "Note created successfully", "id": doc_ref[1].id}, 201
    except Exception as e:
        app.logger.error(f"Error creating note: {e}")
        return {"error": "Failed to create note"}, 500

@app.route('/notes', methods=['GET'])
def get_notes():
    """Retrieve all notes."""
    try:
        notes = []
        for doc in notes_collection.stream():
            note = doc.to_dict()
            note['id'] = doc.id
            notes.append(note)
        return {"notes": notes}, 200
    except Exception as e:
        app.logger.error(f"Error fetching notes: {e}")
        return {"error": "Failed to fetch notes"}, 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
