import os
from flask import Flask, request, render_template, jsonify
from google.cloud import firestore

app = Flask(__name__)

# Initialize Firestore DB
db = firestore.Client()

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/notes', methods=['PUT'])
def add_note():
    """Create a new note from user input."""
    data = request.json()
  

    title = data.get('title')
    content = data.get('content')

    if not title or not content:
        return {"error": "Title and content are required"}, 400

    try:
        doc_ref = db.collection("notes").add({'title': title, 'content': content})
        return {"message": "Note created successfully", "id": doc_ref[1].id}
    except Exception as e:
        app.logger.error(f"Error creating note: {e}")
        return {"error": "Failed to create note"}, 500

@app.route('/notes', methods=['GET'])
def get_notes():
    """Retrieve all notes."""
    notes_ref = db.collection("notes")
    docs = notes_ref.stream()
    notes = []
    for doc in docs:
        note = doc.to_dict()
        note['id'] = doc.id
        notes.append(note)
    return jsonify(notes)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
