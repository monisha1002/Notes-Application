import os
from flask import Flask, render_template, request, jsonify
from google.cloud import firestore
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Initialize Firestore DB
# Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set
# pointing to your service account key file.
# For local development, you might set this in a .env file or directly in your shell.
# In production (e.g., Google Cloud Run/App Engine), credentials are often
# automatically handled if a service account is attached to the service.
db = firestore.Client()
notes_collection = db.collection('notes')

@app.route('/')
def index():
    """Renders the main page of the notes application."""
    return render_template('index.html')

@app.route('/notes', methods=['GET'])
def get_notes():
    """API endpoint to retrieve all notes."""
    try:
        notes = []
        for doc in notes_collection.stream():
            note_data = doc.to_dict()
            note_data['id'] = doc.id  # Add the document ID to the note data
            notes.append(note_data)
        return jsonify(notes), 200
    except Exception as e:
        app.logger.error(f"Error fetching notes: {e}")
        return jsonify({"error": "Failed to fetch notes"}), 500

@app.route('/notes', methods=['PUT'])
def create_or_update_note():
    """API endpoint to create a new note or update an existing one."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request must contain JSON data"}), 400

    title = data.get('title')
    content = data.get('content')
    note_id = data.get('id') # Optional: for updating an existing note

    if not title or not content:
        return jsonify({"error": "Title and content are required"}), 400

    try:
        if note_id:
            # Update existing note
            doc_ref = notes_collection.document(note_id)
            doc_ref.set({'title': title, 'content': content}, merge=True)
            return jsonify({"message": "Note updated successfully", "id": note_id}), 200
        else:
            # Create new note
            doc_ref = notes_collection.add({'title': title, 'content': content})
            return jsonify({"message": "Note created successfully", "id": doc_ref[1].id}), 201
    except Exception as e:
        app.logger.error(f"Error creating/updating note: {e}")
        return jsonify({"error": "Failed to create/update note"}), 500

@app.route('/notes/<id>', methods=['DELETE'])
def delete_note(id):
    """API endpoint to delete a note."""
    try:
        notes_collection.document(id).delete()
        return jsonify({"message": "Note deleted successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error deleting note: {e}")
        return jsonify({"error": "Failed to delete note"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
