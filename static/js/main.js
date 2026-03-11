document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.getElementById('note-form');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const notesList = document.getElementById('notes-list');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');

    // Function to show/hide loading spinner
    const toggleLoading = (show) => {
        if (show) {
            loadingSpinner.classList.remove('d-none');
        } else {
            loadingSpinner.classList.add('d-none');
        }
    };

    // Function to show/hide error message
    const toggleError = (show) => {
        if (show) {
            errorMessage.classList.remove('d-none');
        } else {
            errorMessage.classList.add('d-none');
        }
    };

    // Function to fetch and display notes
    const fetchNotes = async () => {
        toggleLoading(true);
        toggleError(false);
        notesList.innerHTML = ''; // Clear existing notes

        try {
            const response = await fetch('/notes');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const notes = await response.json();
            
            if (notes.length === 0) {
                notesList.innerHTML = '<p class="text-center col-12">No notes yet. Add one above!</p>';
            } else {
                notes.forEach(note => {
                    const noteCard = `
                        <div class="col">
                            <div class="card note-card h-100 shadow-sm" data-id="${note.id}">
                                <div class="card-body">
                                    <h5 class="card-title">${note.title}</h5>
                                    <p class="card-text note-content">${note.content}</p>
                                    <button class="btn btn-danger btn-sm delete-note-btn" data-id="${note.id}">Delete</button>
                                </div>
                            </div>
                        </div>
                    `;
                    notesList.insertAdjacentHTML('beforeend', noteCard);
                });
                // Add event listeners for delete buttons
                document.querySelectorAll('.delete-note-btn').forEach(button => {
                    button.addEventListener('click', handleDeleteNote);
                });
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            toggleError(true);
        } finally {
            toggleLoading(false);
        }
    };

    // Function to handle adding/updating a note
    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = noteTitleInput.value;
        const content = noteContentInput.value;

        // In a more complex app, you'd handle update logic here as well
        // For now, we're just adding new notes
        const noteData = { title, content };

        try {
            const response = await fetch('/notes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(noteData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            noteTitleInput.value = '';
            noteContentInput.value = '';
            fetchNotes(); // Refresh notes list
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save note. Please try again.');
        }
    });

    // Function to handle deleting a note
    const handleDeleteNote = async (event) => {
        const noteId = event.target.dataset.id;
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            // Note: Our current Flask app doesn't have a DELETE endpoint.
            // For this example, I'll simulate a delete or modify the PUT to handle it.
            // For a proper DELETE, you would implement a new Flask route:
            // @app.route('/notes/<id>', methods=['DELETE'])
            // For now, we'll just remove it from the UI after confirmation.
            // To implement a real delete, you would typically send a DELETE request
            // to a specific note ID endpoint.

            // Since the request only asked for PUT/GET, I'll remove it from the UI
            // and log a message. To fully implement delete, a new DELETE /notes/<id>
            // endpoint would be needed in app.py.

            // Simulate UI removal
            event.target.closest('.col').remove();
            alert('Note deleted (from UI). Full deletion requires backend DELETE endpoint.');
            console.warn(`Attempted to delete note with ID: ${noteId}. A backend DELETE /notes/<id> endpoint is needed for full persistence.`);

            // Or, if modifying PUT to handle delete (less RESTful):
            // const response = await fetch('/notes', {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ id: noteId, _delete: true }) // Custom flag for deletion
            // });
            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }
            // fetchNotes();

        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note. Please try again.');
        }
    };


    // Initial fetch of notes when the page loads
    fetchNotes();
});
